import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails
} from 'amazon-cognito-identity-js'
import { logIn } from './api'

const keys = {
    UserPoolId : 'eu-west-1_qsIXCOnEe',
    ClientId : '50aegpdpjl4kq166i8vqlptq6'
}

const userPool = new CognitoUserPool(keys)

export function signUp(user, password, email){
    return new Promise((res, rej) => {
        const attributes = [
            {Name: 'email', Value: email}
        ].map(attr => new CognitoUserAttribute(attr))

        userPool.signUp(user, password, attributes, null, (err, result) => {
            if(err) {
                console.error('[x] sign up operation failed', err)
                rej(err)
            } else{
                const user = result.user
                console.log('user name created:', user.getUsername())
                res()
            }
        })
    })
}

export function signIn(username, password){
    return new Promise((res, rej) => {
        const authDetails = new AuthenticationDetails({Username: username, Password: password})
        const user = new CognitoUser({Username: username, Pool: userPool})
        user.authenticateUser(authDetails, {
            onSuccess: result => {
                const jwt = result.getAccessToken().getJwtToken()
                logIn({username, jwt})
                res()
            },
            onFailure: err => {
                console.log('error signing in:', err)
                rej(err)
            }
        })
    })
}
