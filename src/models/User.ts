import pool from "../database";
import { Query } from "mysql";

export type UserModel = {
  profile: {
    email: string;
    name: string;
    phone: string;
  };
};

export type AuthToken = {
  accessToken: string;
  kind: string;
};

class User  {
  query(queryStatement: string, info: any) {
    return pool.query(queryStatement, info);
  }

  save(userData: any) {
    return this.query("INSERT INTO users SET ?", userData);
  }

  getProfile(queryStatement: string, info: any) {
    return (pool.query(queryStatement, info) as any).then((res: any) => ({
      profile: {
        email: res[0].email,
        name: res[0].name,
        phone: res[0].phone
      }
    }));
  }
}

export default new User();
