import {User} from '../models/user.model.js'


// Register
export const registerUser = async(req, res) =>{
    try {
        const {username , email, password, role} = req.body;

        // basic validation
        if(!username || !email || !password || !role){
            return res.status(400).json({ message: "All fields are important" })
        }

        // check if user exists already
        const existing = await User.findOne({ email: email.toLowerCase()});
        if(existing){
            return res.status(400).json({ message: "User already exists!" })
        }

        // create user

        const user = await User.create({
            username,
            password,
            email: email.toLowerCase(),
            role,
            loggedIn: false,
        });

        res.status(201).json({
            message: 'User registered successfully!',
            user: { id: user._id, email: user.email, username: user.username, role: user.role}
        })

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error:error.message });
    }
}


// Login

export const loginUser = async(req, res) => {
    try {
        const { email, password } = req.body

        // check if the user exists
        const user = await User.findOne({email: email.toLowerCase()});
        if(!user){
            return res.status(400).json({ message: 'User not found' })
        }

        // compare password
        const isMatch = await user.comparePassword(password);
        console.log(isMatch)
        if(!isMatch) return res.status(400).json({
            message: "Invalid credentials"
        })

        res.status(200).json({
            message: 'User Logged in successfully',
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            }
        })

    } catch (error) {
        res.status(500).json({message: 'Internal Server Error', error: error.message})
    }
}


// Logout

export const logoutUser = async(req, res) => {
    try {
        const { email } = req.body

        // check if the user exists
        const user = await User.findOne({email: email.toLowerCase()});
        if(!user){
            return res.status(400).json({ message: 'User not found' })
        }

        res.status(200).json({
            message: 'Logout successfully',
        })

    } catch (error) {
        res.status(500).json({message: 'Internal Server Error', error: error.message})
    }
}