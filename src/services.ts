import { doc, collection } from 'firebase/firestore';
import { db } from '@/firebase'
import { getId, downloadJson } from '@/utils';
import { types, defaultSettings, defaultBoard } from './defaults';
import {
  RetrospectiveSession,
  RetrospectiveColumn,
  RetrospectiveColumns,
  RetrospectiveCard,
  RetrospectiveCardComment,
  RetrospectiveCardAction,
  RetrospectiveCardTag,
  RetrospectiveEvent,
  RetrospectiveType,
  RetrospectiveBoard,
  Member,
  RetrospectiveCardActions,
} from './types';

export const retrospectiveService = {
  // References
  getSessionsRef() {
    return collection(firestore, 'retrospectives');
  },
  getSessionRef(sessionId: string) {
    return this.getSessionsRef().doc(sessionId);
  },
  getColumnsRef(sessionId: string) {
    return this.getSessionRef(sessionId).collection('columns');
  },
  getCardsRef(sessionId: string) {
    return this.getSessionRef(sessionId).collection('cards');
  },
  getConfigRef() {
    return db.collection('admin').doc('retrospectives');
  },
  // Session
  getAllSessions() {
    return this.getSessionsRef();
  },
  getOwnSessions(userId: string) {
    return this.getSessionsRef().where('owner', '==', userId);
  },
  getDraftSessions(userId: string) {
    return this.getOwnSessions(userId).where('status', '==', 'Draft');
  },
  getActiveSessions(userId: string) {
    return this.getOwnSessions(userId).where('status', '==', 'Active');
  },
  getClosedSessions(userId: string) {
    return this.getOwnSessions(userId).where('status', '==', 'Closed');
  },
  async createSession(session: RetrospectiveSession) {
    await this.getSessionRef(session.id).set(session, { merge: true });
  },
  async updateSession(sessionId: string, sessionData: firestore.UpdateData) {
    await this.getSessionRef(sessionId).update(sessionData);
  },
  async deleteSession(sessionId: string) {
    await this.deleteAllCards(sessionId);
    await this.deleteAllColumns(sessionId);
    await this.getSessionRef(sessionId).delete();
  },
  async cloneBoard(sessionId: string, type: RetrospectiveType): Promise<RetrospectiveBoard> {
    const board = defaultBoard();
    type.columns.forEach(async (column) => {
      column.id = getId();
      column.cardIds = [];
      await this.createColumn(sessionId, column);
      board.columnIds.push(column.id);
    });
    return board;
  },
  async cloneSession(session: RetrospectiveSession, user: User): Promise<RetrospectiveSession> {
    const newSession: RetrospectiveSession = JSON.parse(JSON.stringify(session));
    newSession.id = getId();
    newSession.status = 'Draft';
    newSession.board = await this.cloneBoard(newSession.id, types[session.type]);
    newSession.settings = defaultSettings();
    newSession.filters = { participantId: null, cardId: null, tag: null };
    newSession.people = {} as RetrospectiveParticipants;
    newSession.events = [];
    newSession.phase = 0;
    newSession.order = 0;
    newSession.owner = user.id;
    newSession.createdOn = Date.now();
    newSession.updatedOn = null;
    newSession.startedOn = null;
    newSession.completedOn = null;
    await this.createSession(newSession);
    return newSession;
  },
  async exportSession(session: RetrospectiveSession) {
    const retrospective = JSON.parse(JSON.stringify(session)) as Object;

    const columnsSnapshot = await this.getColumnsRef(session.id).get();
    const columns: Record<string, RetrospectiveColumn> = Object.assign(
      {},
      ...columnsSnapshot.docs.map((doc) => ({ [doc.id]: doc.data() }))
    );

    const cardsSnapshot = await this.getCardsRef(session.id).get();
    const cards: Record<string, RetrospectiveCard> = Object.assign(
      {},
      ...cardsSnapshot.docs.map((doc) => ({ [doc.id]: doc.data() }))
    );

    const columnsArray: Object[] = [];
    for (const columnId of retrospective['board']['columnIds']) {
      const column: Object = columns[columnId];
      column['cards'] = [];
      for (const cardId of column['cardIds']) {
        //column['cards'][cardId] = cards[cardId];
        const card = cards[cardId];
        column['cards'].push(card);
      }
      delete column['cardIds'];
      columnsArray.push(column);
    }

    delete retrospective['board']['columnIds'];
    retrospective['board']['columns'] = columnsArray;

    const cardsArray = Object.values(cards);
    const actions: RetrospectiveCardActions = [];
    cardsArray.forEach((card) => card.actions.forEach((action) => actions.push(action)));
    retrospective['actions'] = actions;

    downloadJson(retrospective, session.id);
  },
  exportActions(session: RetrospectiveSession, actions: RetrospectiveCardActions) {
    const actionsArray = JSON.parse(JSON.stringify(actions));
    for (const action of actionsArray) {
      action['createdBy'] = action.createdBy.username;
      action['assignedTo'] = action.assignedTo ? action.assignedTo.username : null;
    }
    downloadJson(actionsArray, session.id + '-actions');
  },
  // Column
  async createColumn(sessionId: string, column: RetrospectiveColumn) {
    await this.getColumnsRef(sessionId).doc(column.id).set(column, { merge: true });
    await this.updateSession(sessionId, { ['board.columnIds']: firestore.FieldValue.arrayUnion(column.id) });
  },
  //async updateColumn(sessionId: string, columnId: string, column: Partial<RetrospectiveColumn>) {
  async updateColumn(sessionId: string, columnId: string, columnData: firestore.UpdateData) {
    await this.getColumnsRef(sessionId).doc(columnId).update(columnData);
    //await this.getColumnsRef(sessionId).doc(columnId).set(column, { merge: true });
  },
  async deleteColumn(sessionId: string, column: RetrospectiveColumn, deleteCards = true) {
    if (deleteCards) {
      await this.deleteColumnCards(sessionId, column);
    }
    await this.updateSession(sessionId, { ['board.columnIds']: firestore.FieldValue.arrayRemove(column.id) });
    await this.getColumnsRef(sessionId).doc(column.id).delete();
  },
  async deleteAllColumns(sessionId: string) {
    const snapshot = await this.getColumnsRef(sessionId).get();
    return snapshot.docs.map(async (doc) => {
      const column = doc.data() as RetrospectiveColumn;
      await this.deleteColumn(sessionId, column);
    });
  },
  // Cards
  async createCard(sessionId: string, card: RetrospectiveCard, column: RetrospectiveColumn) {
    await this.getCardsRef(sessionId).doc(card.id).set(card, { merge: true });
    await this.addCardToColumn(sessionId, column, card);
  },
  async updateCard(sessionId: string, cardId: string, card: Partial<RetrospectiveCard>) {
    await this.getCardsRef(sessionId).doc(cardId).update(card);
  },
  async deleteCard(sessionId: string, cardId: string, column?: RetrospectiveColumn) {
    if (column) await this.removeCardFromColumn(sessionId, column, cardId);
    await this.getCardsRef(sessionId).doc(cardId).delete();
  },
  async addCardToColumn(sessionId: string, column: RetrospectiveColumn, card: RetrospectiveCard) {
    await this.updateColumn(sessionId, column.id, { ['cardIds']: firestore.FieldValue.arrayUnion(card.id) });
  },
  async removeCardFromColumn(sessionId: string, column: RetrospectiveColumn, cardId: string) {
    await this.updateColumn(sessionId, column.id, { ['cardIds']: firestore.FieldValue.arrayRemove(cardId) });
  },
  async deleteColumnCards(sessionId: string, column: RetrospectiveColumn) {
    column.cardIds.forEach(async (cardId) => {
      await this.deleteCard(sessionId, cardId);
    });
  },
  async filterCards(
    sessionId: string,
    where: { id?: string | null; column?: string | null; creatorId?: string | null; tags?: string[] | null },
    orderBy: { fieldPath: string; direction?: 'asc' | 'desc' }
  ) {
    const ref = this.getCardsRef(sessionId);
    let query: firestore.Query = ref;
    if (where.id) {
      query = query.where('id', '==', where.id);
    }
    if (where.column) {
      query = query.where('column', '==', where.column);
    }
    if (where.creatorId) {
      query = query.where('createdBy.id', '==', where.creatorId);
    }
    if (where.tags) {
      query = query.where('createdBy.tags', 'array-contains-any', where.tags);
    }
    query = query.orderBy(orderBy.fieldPath, orderBy.direction);
    return query;
  },
  async deleteAllCards(sessionId: string) {
    const snapshot = await this.getCardsRef(sessionId).get();
    return snapshot.docs.map(async (doc) => {
      const card = doc.data();
      await this.deleteCard(sessionId, card.id);
    });
  },
  // Comments
  async createComment(sessionId: string, cardId: string, comment: RetrospectiveCardComment) {
    await this.getCardsRef(sessionId)
      .doc(cardId)
      .update({ ['comments']: firestore.FieldValue.arrayUnion(comment) });
  },
  async deleteComment(sessionId: string, cardId: string, comment: RetrospectiveCardComment) {
    await this.getCardsRef(sessionId)
      .doc(cardId)
      .update({ ['comments']: firestore.FieldValue.arrayRemove(comment) });
  },
  // Actions
  async createAction(sessionId: string, cardId: string, action: RetrospectiveCardAction) {
    await this.getCardsRef(sessionId)
      .doc(cardId)
      .update({ ['actions']: firestore.FieldValue.arrayUnion(action) });
  },
  async deleteAction(sessionId: string, cardId: string, action: RetrospectiveCardAction) {
    await this.getCardsRef(sessionId)
      .doc(cardId)
      .update({ ['actions']: firestore.FieldValue.arrayRemove(action) });
  },
  // Tags
  async createTag(sessionId: string, cardId: string, tag: RetrospectiveCardTag) {
    await this.getCardsRef(sessionId)
      .doc(cardId)
      .update({ ['tags']: firestore.FieldValue.arrayUnion(tag) });
  },
  async deleteTag(sessionId: string, cardId: string, tag: RetrospectiveCardTag) {
    await this.getCardsRef(sessionId)
      .doc(cardId)
      .update({ ['tags']: firestore.FieldValue.arrayRemove(tag) });
  },
  // Voting
  async upvoteCard(sessionId: string, cardId: string, userId: string, count = 1) {
    await this.getCardsRef(sessionId)
      .doc(cardId)
      .update({
        [`votes.${userId}`]: firestore.FieldValue.increment(count),
        ['votesCount']: firestore.FieldValue.increment(count),
      });
  },
  async downvoteCard(sessionId: string, cardId: string, userId: string, count = -1) {
    await this.getCardsRef(sessionId)
      .doc(cardId)
      .update({
        [`votes.${userId}`]: firestore.FieldValue.increment(count),
        ['votesCount']: firestore.FieldValue.increment(count),
      });
  },
  // Participants
  async createParticipant(sessionId: string, participant: RetrospectiveParticipant) {
    await this.updateSession(sessionId, { [`people.${participant.id}`]: participant });
  },
  async updateParticipant(sessionId: string, participant: RetrospectiveParticipant) {
    await this.updateSession(sessionId, { [`people.${participant.id}`]: participant });
  },
  async deleteParticipant(sessionId: string, participantId: string) {
    await this.updateSession(sessionId, { [`people.${participantId}`]: firestore.FieldValue.delete() });
  },
  // Events
  async createEvent(sessionId: string, event: RetrospectiveEvent) {
    await this.updateSession(sessionId, { ['events']: firestore.FieldValue.arrayUnion(event) });
  },
};

export default { retrospectiveService };
