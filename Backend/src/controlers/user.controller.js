import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt,{hash} from "bcrypt"
import crypto from "crypto"

const login=async(req,res)=>{

    const {userName,password} =req.body;
    if(!userName || !password){
        return res.status(400).json({message:"please provide"})
    }
    
    
    try{
        const user=await User.findOne({userName});
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message:"user not found"})
        } 
        if(bcrypt.compare(password,user.password)){
            let token =crypto.randomBytes(20).toString("hex");
            user.token=token;
            await user.save();
            return res.status(httpStatus.OK).json({token:token})
        }
    }catch(e){
        return res.status(500).json({message:`something went wrong ${e}`})
    }
}




const register=async(req,res)=>{
    const {name,userName,password} = req.body;

    try{
        const existingUser=await User.findOne({userName});
        if(existingUser){
            return res.status(httpStatus.FOUND).json({message:"user already exists"})
        }
        const hashedPassword=await bcrypt.hash(password,10);

        const newUser=new User({
            name:name,
            userName:userName,
            password:hashedPassword
        });
        await newUser.save();

        res.status(httpStatus.CREATED).json({message:"User registered"})
    }
    catch(e){
        res.json({message:`something went wrong ${e}`})
    }
}


export {login,register}