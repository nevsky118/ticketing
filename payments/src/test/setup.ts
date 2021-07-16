// import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
// import { app } from '../app';
jest.mock('../nats-wrapper');

process.env.STRIPE_KEY =
	'sk_test_51J1wiXF9a2feNfDP4b1CKlNMALs7mASebUOVNwvOSdMAAT2jmC8dMtT30hNRy3ixahu7TxPwhoVXrXTFcvHqcSkM00F7K7kLJB';

let mongo: any;
beforeAll(async () => {
	process.env.JWT_KEY = 'secret';

	mongo = await MongoMemoryServer.create();
	const mongoUri = await mongo.getUri();

	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
});

beforeEach(async () => {
	jest.clearAllMocks();
	const collections = await mongoose.connection.db.collections();

	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	await mongo.stop();
	await mongoose.connection.close();
});
