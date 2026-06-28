// Database Service for RentiHub
// Centralized database operations for all modules

class DatabaseService {
    constructor() {
        this.db = null;
    }

    init() {
        const { db } = initializeFirebase();
        this.db = db;
    }

    // Generic CRUD operations

    // Create document
    async create(collection, data) {
        try {
            const docRef = await this.db.collection(collection).add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error(`Error creating document in ${collection}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Read document by ID
    async read(collection, docId) {
        try {
            const doc = await this.db.collection(collection).doc(docId).get();
            if (doc.exists) {
                return { success: true, data: { id: doc.id, ...doc.data() } };
            } else {
                return { success: false, error: 'Document not found' };
            }
        } catch (error) {
            console.error(`Error reading document from ${collection}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Read all documents from collection
    async readAll(collection, orderBy = 'createdAt', orderDirection = 'desc') {
        try {
            const snapshot = await this.db.collection(collection)
                .orderBy(orderBy, orderDirection)
                .get();

            const data = [];
            snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, data: data };
        } catch (error) {
            console.error(`Error reading all from ${collection}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Query documents with conditions
    async query(collection, conditions = [], orderBy = null, limit = null) {
        try {
            let query = this.db.collection(collection);

            // Apply conditions
            conditions.forEach(condition => {
                query = query.where(condition.field, condition.operator, condition.value);
            });

            // Apply ordering
            if (orderBy) {
                query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
            }

            // Apply limit
            if (limit) {
                query = query.limit(limit);
            }

            const snapshot = await query.get();
            const data = [];
            snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, data: data };
        } catch (error) {
            console.error(`Error querying ${collection}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Update document
    async update(collection, docId, data) {
        try {
            await this.db.collection(collection).doc(docId).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error(`Error updating document in ${collection}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Delete document
    async delete(collection, docId) {
        try {
            await this.db.collection(collection).doc(docId).delete();
            return { success: true };
        } catch (error) {
            console.error(`Error deleting document from ${collection}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Batch operations
    async batchWrite(operations) {
        try {
            const batch = this.db.batch();

            operations.forEach(operation => {
                const ref = this.db.collection(operation.collection).doc(operation.docId);

                switch (operation.type) {
                    case 'set':
                        batch.set(ref, operation.data);
                        break;
                    case 'update':
                        batch.update(ref, operation.data);
                        break;
                    case 'delete':
                        batch.delete(ref);
                        break;
                }
            });

            await batch.commit();
            return { success: true };
        } catch (error) {
            console.error('Error in batch write:', error);
            return { success: false, error: error.message };
        }
    }

    // Real-time listener
    listen(collection, callback, conditions = []) {
        let query = this.db.collection(collection);

        conditions.forEach(condition => {
            query = query.where(condition.field, condition.operator, condition.value);
        });

        return query.onSnapshot(snapshot => {
            const data = [];
            snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });
            callback(data);
        });
    }
}

// Create global instance
const dbService = new DatabaseService();
