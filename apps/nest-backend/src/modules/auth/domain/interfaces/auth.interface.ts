//nada de roles o datos, estos se obtinen al momento
export interface AuthClaims {
  userId: number;
}

export interface LoginProps {
  //correo o nombre de usuario, el dominio no distingue cual de los dos es
  identifier: string;
  password: string;
}

export interface RegisterProps {
  username: string;
  email: string;
  password: string;
}

//agregar aqui fecha de expiracion
export interface IssuedToken {
  token: string;
}

export interface AuthenticatedCaller {
  userId: number;
}
