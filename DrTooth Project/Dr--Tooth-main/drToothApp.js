
const express=require("express")
const app=express()
const {engine}=require("express-handlebars")

const mongoose=require("mongoose")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
var XLSX = require('xlsx');
const nodemailer=require("nodemailer")
const patientModel=require("./models/patients")
const appointmentModel=require("./models/appointment")
const bodyParser=require("body-parser")
const sessionStorage=require("sessionstorage-for-nodejs")
const res = require("express/lib/response")
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static("public"))
drUserName="Dr. Marium"
drpassword="Aliscreams007"
var username1=''
var username2=''
const secret="dvkydhdiad465121@#$%cffkubjvh"


app.engine('hbs',engine({

    defaultLayout:"main",
    extname:".hbs"

}))
app.set("view engine","hbs")


mongoose.connect("mongodb+srv://abbas:fBdba6lmRQdntuFG@cluster0.rmtid.mongodb.net/DrTooth?retryWrites=true&w=majority",{


    useUnifiedTopology:true,
    useNewUrlParser:true


})
const db=mongoose.connection
db.on("error",function(){
    console.log("error")
})
db.once("open",function(){
    console.log("Dr_Tooth Database connected successfully")
})

const auth=(req,res,next)=>{

    const sessionToken=sessionStorage.getItem("sessionToken")

    if(sessionToken){

        jwt.verify(sessionToken,secret,(err,patient)=>{
            if(err){
                return res.sendStatus(403)
            }
            req.patient=patient
            next()
        })

    }
    else{
        res.sendStatus(401)
    }


}

app.get("/",async(req,res)=>{

   res.render("login")
    
   


})

app.get("/appointment",auth,(req,res)=>{
    res.render("appointment")
})

app.get("/signup",(req,res)=>{
    res.render("signup")
})

app.post("/dashboard",async(req,res)=>{

    username2=""

    username1=username1+req.body.username;
    username2=username2+req.body.username;

   const dentalPatient=await patientModel.findOne({username:req.body.username})

   

   if(!dentalPatient){
       res.send("Incorrect Username or Password")
   }

   const validPassword=await bcrypt.compare(req.body.password, dentalPatient.password)
   if(!validPassword){
    res.send("Incorrect Username or Password")
}

   if(dentalPatient && validPassword){

    const tokenGenerated=jwt.sign({username:dentalPatient.username},secret)
    sessionStorage.setItem("sessionToken",tokenGenerated)  
    res.render("home.hbs")

   }
   
   

})
app.post("/booked",auth,async(req,res)=>{

    const oldAppointee=await appointmentModel.findOne({username:username1})
    if(oldAppointee){

        await appointmentModel.findOneAndUpdate({username:username1},{$push:{date:req.body.date}})

        new_date=req.body.date
        new_name=req.body.name
        mail=new_name+" has booked his/her slot on "+new_date+"."
        let transporter = nodemailer.createTransport({
            host: "smtp-mail.outlook.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: "Dr_Tooth_Dental_Clinic@outlook.com", 
              pass: "DrDoctor@tooth", 
            },
          });
        
          // send mail with defined transport object
          let info = await transporter.sendMail({
            from: "Dr_Tooth_Dental_Clinic@outlook.com", // sender address
            to: "abbasali.pathan@gmail.com", // list of receivers
            subject: "Dr. Tooth", // Subject line
            text:mail // plain text body
             
          });
        
          console.log("Message sent: %s", info.messageId);
          
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          
        
          username1=""
          res.render("book")
       

    }

    else{

    appointment={
        username:username1,
        name:req.body.name,
        date:req.body.date
    }
        const data = await appointmentModel.create(appointment)
        new_date=req.body.date
        new_name=req.body.name
        mail=new_name+" has booked his/her slot on "+new_date+"."
        let transporter = nodemailer.createTransport({
            host: "smtp-mail.outlook.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: "Dr_Tooth_Dental_Clinic@outlook.com", 
              pass: "DrDoctor@tooth", 
            },
          });
        
          // send mail with defined transport object
          let info = await transporter.sendMail({
            from: "Dr_Tooth_Dental_Clinic@outlook.com", // sender address
            to: "abbasali.pathan@gmail.com", // list of receivers
            subject: "Dr. Tooth", // Subject line
            text:mail // plain text body
             
          });
        
          console.log("Message sent: %s", info.messageId);
          
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          
        
          username1=""
          res.render("book")
       
    }



})

app.post("/signupLogin",async(req,res)=>{

    const salt=await bcrypt.genSalt(10)
    const hashPassword=await bcrypt.hash(req.body.password,salt)
    patient={
        username:req.body.username,
        email:req.body.email,
        mobile_number:req.body.mobile_number,
        password:hashPassword
    }
        const data = await patientModel.create(patient)
        res.render("signupLogin")


})
app.get("/drOnly",(req,res)=>{
    res.render("drOnly")
})

app.post("/drOnly",(req,res)=>{

    if(drUserName==req.body.username && drpassword==req.body.password){

        var wb = XLSX.utils.book_new(); //new workbook
    appointmentModel.find((err,data)=>{
        if(err){
            console.log(err)
        }else{
            var temp = JSON.stringify(data);
            temp = JSON.parse(temp);
            var ws = XLSX.utils.json_to_sheet(temp);
            var down = __dirname+'/public/exportdata.xlsx'
           XLSX.utils.book_append_sheet(wb,ws,"sheet1");
           XLSX.writeFile(wb,down);
           res.download(down);
        }
    });


        

    }
    else{
        res.send("Incorrect Username or Password")
    }


})

app.get("/expertise",auth,(req,res)=>{
    res.render("expertise")
})
app.get("/user",auth,async(req,res)=>{
    const users=await appointmentModel.findOne({username:username2})
    const patients=await patientModel.findOne({username:username2})
    res.render("users",{
        user:{
            username:users.username,
            name:users.name,
            email:patients.email,
            mobile:patients.mobile_number,
            date:users.date
        }
    })
})
const port=process.env.PORT||3000

app.listen(port,()=>{
    console.log("Dr Tooth Server is running............")
})

