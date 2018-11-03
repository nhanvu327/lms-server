import bcrypt from "bcrypt";

export type UserModel = {
  email: string;
  // password: string;
  // passwordResetToken: string;
  // passwordResetExpires: Date;

  // facebook: string;
  // tokens: AuthToken[];

  // profile: {
  //   name: string;
  //   gender: string;
  //   location: string;
  //   website: string;
  //   picture: string;
  // };

  // comparePassword: comparePasswordFunction;
  // gravatar: (size: number) => string;
};

export type AuthToken = {
  accessToken: string;
  kind: string;
};

type comparePasswordFunction = (
  candidatePassword: string,
  cb: (err: any, isMatch: any) => {}
) => void;

const comparePassword: comparePasswordFunction = function(
  candidatePassword,
  cb
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch: boolean) => {
    cb(err, isMatch);
  });
};
