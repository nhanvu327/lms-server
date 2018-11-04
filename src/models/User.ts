import pool from "../database";

export type UserModel = {
  profile: {
    email: string;
    name: string;
    phone: string;
  };
};

export type UserFromDB = {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: Number;
  password: string;
  created: Date;
  modified: Date;
};

export type AuthToken = {
  accessToken: string;
  kind: string;
};

class User {
  query(queryStatement: string, info: any) {
    return pool.query(queryStatement, info);
  }

  save(userData: any) {
    return this.query("INSERT INTO users SET ?", userData);
  }

  queryProfile(queryStatement: string, info: any) {
    return (pool.query(queryStatement, info) as any).then((res: any) =>
      this.getProfile(res[0])
    );
  }

  getProfile(data: UserFromDB) {
    return {
      profile: {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role
      }
    };
  }
}

export default new User();
