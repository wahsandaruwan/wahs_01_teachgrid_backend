import mongoose from "mongoose";

const userSchema = new mangoose.Schema({
    //personal data
    name : {type: String, required : true},
    email : {type: String, required : true, unique : true},
    password : {type: String, required : true},
   phoneNum : {type: Number , required : true},

   //Role 
   role : {type: String,
            enum: ["admin", "teacher"],
            default: "teacher",
            required: true
   },

   // data for verification
   verifyOtp : {type: String, default: ''},
   verifyOtpExpireAt : {type: Number, default: 0},
   isAccountVerified : {type: Boolean, default: false},
   resetOtp : {type: String, default: ''},
   resetOtpExpireAt : {type: Number, default: 0},
});

const userModel = mangoose.models.user || mangoose.model('user', userSchema);

export default userModel; 