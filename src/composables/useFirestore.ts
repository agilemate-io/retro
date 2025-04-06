import { collection, addDoc, updateDoc, deleteDoc, query, where, getDocs, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import type { DocumentData } from 'firebase/firestore'

export function useFirestore() {
  const addDocument = async <T extends DocumentData>(collectionName: string, data: T) => {
    const collectionRef = collection(db, collectionName)
    return addDoc(collectionRef, data)
  }

  const updateDocument = async <T extends DocumentData>(path: string, data: Partial<T>) => {
    const docRef = doc(db, path)
    return updateDoc(docRef, data as DocumentData)
  }

  const deleteDocument = async (path: string) => {
    const docRef = doc(db, path)
    return deleteDoc(docRef)
  }

  const queryCollection = async <T>(
    collectionName: string,
    constraints: { field: string; operator: string; value: any }[]
  ) => {
    const collectionRef = collection(db, collectionName)
    const q = query(
      collectionRef,
      ...constraints.map(c => where(c.field, c.operator as any, c.value))
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as T[]
  }

  return {
    addDoc: addDocument,
    updateDoc: updateDocument,
    deleteDoc: deleteDocument,
    queryCollection
  }
} 