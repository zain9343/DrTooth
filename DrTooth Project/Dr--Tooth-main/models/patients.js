const mongoose=require("mongoose")
const patientSchema= new mongoose.Schema({


    username:{
        type:String,
        unique:true,
        minlength:5,
        required:true
    },
    
    password:{
        type:String,
        unique:true,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    mobile_number:{
        type:String,
        unique:true,
        required:true
    }
})



const Patient=mongoose.model("Patient",patientSchema)

module.exports=Patient


