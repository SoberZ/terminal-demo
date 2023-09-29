import Keycloak from "keycloak-js";
import HttpService from "./HttpService";

const axiosInstance = HttpService.getAxiosClient();

const _kc = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT,
});

const initKeycloak = async () => {
    return _kc.init({
        onLoad: "login-required",
    });
};

const doLogin = _kc.login;

const doLogout = _kc.logout;

const getToken = () => _kc.token;

const isLoggedIn = () => !!_kc.token;

const updateToken = (successCallback) =>
    _kc.updateToken(5).then(successCallback).catch(doLogin);

const getUsername = () => _kc.tokenParsed?.preferred_username;

const hasRole = (roles) => roles.some((role) => _kc.hasRealmRole(role));

/**
 * Get all users from the keycloak instance.
 * @returns users list
 */
const getUsers = async () => {
    const res = await axiosInstance.get(
        `${import.meta.env.VITE_KEYCLOAK_URL}admin/realms/${
            import.meta.env.VITE_KEYCLOAK_REALM
        }/users`,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getToken()}`,
            },
        }
    );
    return res.data;
};

/**
 * Get information about the current realm
 * @returns realm information
 */
const getRealm = async () => {
    const res = axiosInstance.get(
        `${import.meta.env.VITE_KEYCLOAK_URL}admin/realms/${
            import.meta.env.VITE_KEYCLOAK_REALM
        }`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
            },
        }
    );
    return res;
};

/**
 * Get all roles from the realm
 * @returns realm roles
 */
const getAllRoles = async () => {
    const res = await axiosInstance.get(
        `${import.meta.env.VITE_KEYCLOAK_URL}admin/realms/${
            import.meta.env.VITE_KEYCLOAK_REALM
        }/roles`,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${getToken()}`,
            },
        }
    );
    return res.data;
};

/**
 * Retrieve the user roles of a user
 * @param {string} id
 * @returns user roles
 */
const getUserRoles = async (id) => {
    const res = await axiosInstance.get(
        `${import.meta.env.VITE_KEYCLOAK_URL}admin/realms/${
            import.meta.env.VITE_KEYCLOAK_REALM
        }/users/${id}/role-mappings`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
            },
        }
    );
    return res;
};

/**
 * Retrieve available user role mappings
 * @param {string} id
 * @returns user roles
 */
const getAvailableRoles = async (id) => {
    const res = await axiosInstance.get(
        `${import.meta.env.VITE_KEYCLOAK_URL}admin/realms/${
            import.meta.env.VITE_KEYCLOAK_REALM
        }/users/${id}/role-mappings/realm/available`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
            },
        }
    );
    return res;
};

/**
 * Set a number of roles to a user
 * @param {string} id
 * @returns request success
 */
const setUserRoles = async (id, newRoles) => {
    const res = await axiosInstance({
        method: "POST",
        url:`${import.meta.env.VITE_KEYCLOAK_URL}admin/realms/${
            import.meta.env.VITE_KEYCLOAK_REALM
        }/users/${id}/role-mappings/realm`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        data: JSON.stringify(newRoles)
    })

    return res;
};


/**
 * Remove a number of roles to a user
 * @param {string} id
 * @returns request success
 */
const removeUserRoles = async (id, oldRoles) => {
    const res = await axiosInstance({
        method: "DELETE",
        url:`${import.meta.env.VITE_KEYCLOAK_URL}admin/realms/${
            import.meta.env.VITE_KEYCLOAK_REALM
        }/users/${id}/role-mappings/realm`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        data: JSON.stringify(oldRoles)
    })

    return res;
};

/**
 * Get the data of one user
 * @param {string} username
 * @returns
 */
const getUser = async (username) => {
    const res = await axiosInstance.get(
        `${import.meta.env.VITE_KEYCLOAK_URL}admin/realms/${
            import.meta.env.VITE_KEYCLOAK_REALM
        }/users`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
            },
            params: {
                username,
            },
        }
    );
    return res;
};

/**
 * Reset the user's password using a new password.
 * @param {string} user
 * @param {string} password
 * @returns
 */
const resetPassword = async (id, password) => {
    const res = await axiosInstance.put(
        `${import.meta.env.VITE_KEYCLOAK_URL}admin/realms/${
            import.meta.env.VITE_KEYCLOAK_REALM
        }/users/${id}/reset-password`,
        {
            value: password,
            type: "password",
            temporary: false,
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
            },
        }
    );
    return res;
};

/**
 * Set the favorite strategies of a user
 * @param {*} id 
 * @param {*} favorites 
 */
const setFavorites = async (id, favorites) => {
    const res = await axiosInstance.put(
        `${import.meta.env.VITE_KEYCLOAK_URL}admin/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/users/${id}`,
        {
            "attributes": {
                favorites
            } 
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
            },
        }
    )
}

/**
 * Get the favorite strategies of a user
 * @param {string} username
 */
const getFavorites = async (username) => {
    let res = await getUser(username)
    return res.data[0].attributes.favorites
}

/**
 * Get the ID of a user with the username
 * @param {string} username 
 * @returns 
 */
const getUserId = async (username) => {
    let res = await UserService.getUser(UserService.getUsername())
    return res.data[0].id
}

const UserService = {
    doLogin,
    doLogout,
    isLoggedIn,
    getToken,
    updateToken,
    getUsername,
    getUser,
    getRealm,
    hasRole,
    initKeycloak,
    getAvailableRoles,
    getUsers,
    getAllRoles,
    resetPassword,
    getUserRoles,
    setUserRoles,
    removeUserRoles,
    setFavorites,
    getFavorites,
    getUserId
};

export default UserService;
