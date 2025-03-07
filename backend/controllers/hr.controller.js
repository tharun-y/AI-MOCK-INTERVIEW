import hrQuestionsModel from "../models/hrQuestions.model.js";

export const createNewForm = async (req, res) => {
    const form = req.body;
    form.role = "HR";
    if (!form.authenticate || !form.techStack || !form.experience || !form.numberOfQuestions || !form.questions) {
        return res.status(400).json({ success: false, message: "Please fill out all fields." });
    }

    if (form.questions.length !== form.numberOfQuestions) {
        return res.status(400).json({ success: false, message: "Please enter the correct Number of Questions." });
    }

    const totalForms = await hrQuestionsModel.countDocuments({ authenticate: form.authenticate });
    form.formID = totalForms + 1;

    const newForm = new hrQuestionsModel(form);
    try {
        await newForm.save();
        return res.status(201).json({ success: true, data: newForm }); 
    } catch (error) {
        console.error("Error in adding form:", error); 
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getForm = async (req, res) => {
    const form = req.body;
    
    console.log("Received Data:", form); // Debugging log

    if (!form.authenticate || !form.formID) {
        return res.status(400).json({ success: false, message: "Please enter all the fields." });
    }

    const formID = parseInt(form.formID, 10); // Convert to number

    const totalForms = await hrQuestionsModel.countDocuments({ authenticate: form.authenticate  , role : "HR"}); 

    console.log("Total Forms:", totalForms); // Debugging log

    if (totalForms < formID) {
        return res.status(400).json({ success: false, message: "Please enter a valid form ID." });
    }

    const user = await hrQuestionsModel.findOne({ authenticate: form.authenticate, formID: formID });

    if (!user) { 
        return res.status(404).json({ success: false, message: "Form not found." });
    }

    return res.status(200).json({ 
        success: true, 
        data: { 
            questions: user.questions, 
        } 
    });
}

export const getallforms = async (req, res) => {
    try {
        const forms = await hrQuestionsModel.find();

        if (forms.length === 0) {
            return res.status(404).json({ success: false, message: "No forms found." });
        }

        return res.status(200).json({ 
            success: true, 
            data: forms 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};
