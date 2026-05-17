import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@doafood:session';

export async function setSession(user, token) {
  const current = await AsyncStorage.getItem(SESSION_KEY);
  const storedToken = current ? JSON.parse(current).token : null;
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ user, token: token ?? storedToken }));
}

export async function getSession() {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw).user : null;
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
