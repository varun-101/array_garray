import aiService from "../services/aiService.js";
const aiResponseController = async(req, res) => {
    try{
        const {metaData} = req.body;
        const response = await aiService(metaData);
        res.status(200).json({ message:response});

    } catch(err){
        console.log(err);
        res.status(500).json({message: "Internal server error"});
    }
}


export default aiResponseController;