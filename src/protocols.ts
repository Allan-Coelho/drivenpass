export type ApplicationError = {
  name: string;
  message: string;
};

export type CredentialsBody = {
  title: string;
  username: string;
  url: string;
  userId: number;
  password: string;
};

export type NetworksBody = {
  password: string;
  network: string;
  title: string;
};
