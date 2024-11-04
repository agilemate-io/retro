// Roles
enum Roles {
  Owner,
  Moderator,
  Participant
}

// Member
export interface Member {
  id: string;
  username: string | null;
  password?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  teams?: Teams | null;
  lastLogon?: number | null;
  role: Roles
}
export type Members = Member[];


// Team
export interface Team {
  id?: string;
  tid?: string;
  title: string;
  description?: string;
  color?: string;
  owner: string;
  members: Member[];
  invited?: string[];
}
export type Teams = Team[];

// Board
export interface Board {
  id?: string;
  title?: string;
  description?: string;
  type?: string;
  columns?: Columns;
  rows?: Rows;
  owner: string;
  teams?: Teams;
}
export type Boards = Board[];

// Swimlane/Row
export interface Row {
  title?: string;
  description?: string;
  color?: string;
  columns: Columns;
}
export type Rows = Row[];

// State/Column
export interface Column {
  title?: string;
  description?: string;
  color?: string;
  limit?: number;
  cards?: Cards;
}
export type Columns = Column[];

// Card
export interface Card {
  title?: string;
  description?: string;
  color?: string;
  assignee?: string;
}
export type Cards = Card[];


export interface RetrospectivePhase {
  title?: string;
  description?: string | null;
  duration?: number | null;
}
export type RetrospectivePhases = RetrospectivePhase[];

export interface RetrospectiveTheme {
  id: string;
  title: string;
  description?: string;
  background?: string | null;
  image?: string;
  colors: { text?: string; highlight?: string; background?: string; font?: string };
}
export type RetrospectiveThemes = Record<string, RetrospectiveTheme>;

export type RetrospectiveSettings = {
  enableComments: boolean;
  enableActions: boolean;
  enableTags: boolean;
  enableVoting: boolean;
  enableEditing: boolean;
  enableMoving: boolean;
  enableGrouping: boolean;
  showAllCards: boolean;
  showAllVotes: boolean;
  maxVotes: number;
};

export interface RetrospectiveEvent {
  id: string;
  title: string;
  description?: string | null;
  timestamp?: number;
  status?: string;
  uid?: string;
  color?: string;
}
export type RetrospectiveEvents = RetrospectiveEvent[];

export interface RetrospectiveCardComment {
  title: string;
  description?: string | null;
  createdBy: Member;
  createdOn: number;
  updatedBy?: Member | null;
  updatedOn?: number | null;
}
export type RetrospectiveCardComments = RetrospectiveCardComment[];

export interface RetrospectiveCardAction {
  cardId: string;
  title: string;
  description?: string | null;
  createdBy: Member;
  createdOn: number;
  updatedBy?: Member | null;
  updatedOn?: number | null;
  assignedTo?: Member | null;
  dueOn?: number | null;
  completedOn?: number | null;
}
export type RetrospectiveCardActions = RetrospectiveCardAction[];

export type RetrospectiveCardTag = string;
export type RetrospectiveCardTags = RetrospectiveCardTag[];

export interface RetrospectiveCardVotes {
  [key: string]: number;
}

export interface RetrospectiveCard {
  id: string;
  title?: string;
  description?: string | null;
  color?: string | null;
  createdBy: Member;
  createdOn: number;
  updatedBy?: Member | null;
  updatedOn?: number | null;
  votes?: RetrospectiveCardVotes | null;
  votesCount: number;
  //votes?: Map<string, number> | null;
  comments: RetrospectiveCardComments;
  actions: RetrospectiveCardActions;
  tags: RetrospectiveCardTags;
}
export type RetrospectiveCards = RetrospectiveCard[];
//export type RetrospectiveCards = Record<string, RetrospectiveCard>;

export interface RetrospectiveColumn {
  id: string;
  title: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  prompt?: string | null;
  cardIds: string[];
  limit?: number | null;
  showLimit?: boolean | null;
}
export type RetrospectiveColumns = RetrospectiveColumn[];
export type RetrospectiveColumnsMap = Record<string, RetrospectiveColumn>;

export interface RetrospectiveBoard {
  title?: string | null;
  description?: string | null;
  color?: string | null;
  columnIds: string[];
  readonly?: boolean;
}

export interface RetrospectiveType {
  id: string;
  title: string;
  description?: string | null;
  columns: RetrospectiveColumns;
}
//export type RetrospectiveTypes = RetrospectiveType[];
export type RetrospectiveTypes = Record<string, RetrospectiveType>;

export interface RetrospectiveFilters {
  participantId: string | null;
  cardId: string | null;
  tag: string | null;
}

export interface RetrospectiveSession {
  id: string;
  title: string;
  description?: string | null;
  background?: string | null;
  status: string;
  type: string;
  theme: string;
  board: RetrospectiveBoard;
  settings: RetrospectiveSettings;
  filters: RetrospectiveFilters;
  people: Members;
  events: RetrospectiveEvents;
  phase: number;
  order: number;
  timer?: number;
  owner: string;
  createdOn?: number;
  updatedOn?: number | null;
  startedOn?: number | null;
  completedOn?: number | null;
}

export type RetrospectiveSessions = RetrospectiveSession[];
