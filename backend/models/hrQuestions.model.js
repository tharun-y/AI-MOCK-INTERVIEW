import mongoose from "mongoose";

const hrQuestionsSchema = new mongoose.Schema({
    authenticate :{
        type: String,
        required: true,
    },
    techStack: {
        type: String,
        required: true,
    },
    role : {
        type : String,
        required : true,
    },
    formID : {
        type: Number,
        required: true,
    },
    experience: {
        type: String,
        required: true,
    },
    numberOfQuestions: {
        type: Number,
        required: true,
        min: 1,
    },
    questions: {
        type: [
            {
                question: { type: String, required: true },
            },
        ],
        validate: {
            validator: function (v) {
                return v.length === this.numberOfQuestions;
            },
            message: (props) =>
                `Number of questions (${props.value.length}) does not match the 'numberOfQuestions' field (${this.numberOfQuestions}).`,
        },
    },
},  { timestamps: true });

const hrQuestionsModel = mongoose.model("hrQuestions", hrQuestionsSchema);
export default hrQuestionsModel;