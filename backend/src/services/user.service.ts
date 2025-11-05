import User from './../models/user.model';

interface UserData{
    name?:string;
    email: string;
    password: string;
    role?: string;
}
class UserService{
    async createUser(userData: UserData){
        try {
            const createdUser = new User(userData);
            await createdUser.save();
            const {password, ...userWithoutPassword} = createdUser.toObject();
            return userWithoutPassword;
        } catch (error) {
            if(error instanceof Error){
                throw error;
            }
            throw new Error('Error while creating User');
        }
    }
    async getUserByEmail(email: string){
        try {
            const user = await User.findOne({email});
            return user;
        } catch (error) {
            if(error instanceof Error){
                throw error;
            }
            throw new Error('Error while getting User by email');
        }
    }
}

export default new UserService();