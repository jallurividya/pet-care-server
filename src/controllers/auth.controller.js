import { supabase } from "../config/SupabaseConfig.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
export const signup = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body
        if (!name || !email || !password || !phone) {
            return res.status(400).send({
                status: false,
                message: "The name, email, password, phone fields are required"
            })
        }
        if (role && !["admin", "user"].includes(role)) {
            return res.status(400).send({
                status: false,
                error: "Role must be admin or user."
            })
        }
        const { data: existing } = await supabase.from("app_users").select().eq("email", email).maybeSingle()
        if (existing) {
            return res.status(409).send({
                status: false,
                error: `User with the email ${email} already exists.`
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const payload = {
            name,
            email,
            password: hashedPassword,
            role: "user",
            phone
        }
        if (role) payload.role = role
        const { data, error } = await supabase.from("app_users").insert([payload]).select("name, email, role, phone")
        if (error) throw error
        res.status(201).send({
            status: true,
            message: `User created successfully`,
            data
        })
    } catch (error) {
        console.log("Error occured while registering a new user is ", error.message);
        res.status(500).send({
            status: false,
            error: "Internal server error"
        });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: false,
                message: "Email and password are required"
            });
        }

        const { data: existing, error } = await supabase
            .from("app_users")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !existing) {
            return res.status(400).json({
                status: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, existing.password);

        if (!isMatch) {
            return res.status(400).json({
                status: false,
                message: "Invalid email or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET not defined");
        }

        const token = jwt.sign(
            { id: existing.id, role: existing.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            status: true,
            data: existing,
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};