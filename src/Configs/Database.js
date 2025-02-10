"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// import { configs } from "../ENV.cofnigs/ENV.configs";
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // if (!configs.MONGODB_URL_TUTOR) {
        //   throw new Error("MONGO_URI is not defined in the environment variables");
        // }
        console.log('mongodb+srv://jacksoncheriyan05:MongoDBPassword@cluster0.oh2lv.mongodb.net/SAGACOORDINATOR');
        yield mongoose_1.default.connect('mongodb+srv://jacksoncheriyan05:MongoDBPassword@cluster0.oh2lv.mongodb.net/SAGACOORDINATOR');
        console.log("Tutor Service Database connected");
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
