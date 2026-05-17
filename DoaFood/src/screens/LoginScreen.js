import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme';
import { setSession } from '../services/db';
import { login as apiLogin } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]           = useState('');
  const [senha, setSenha]           = useState('');
  const [mostrarSenha, setMostrar]  = useState(false);
  const [erros, setErros]           = useState({});
  const [carregando, setCarregando] = useState(false);

  function validar() {
    const e = {};
    if (!email.trim()) e.email = 'Informe seu e-mail.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido.';
    if (!senha) e.senha = 'Informe sua senha.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleEntrar() {
    if (!validar()) return;
    setCarregando(true);

    try {
      const { token, user } = await apiLogin(email.trim().toLowerCase(), senha);
      await setSession(user, token);
    } catch {
      setErros({ geral: 'E-mail ou senha incorretos.' });
      setCarregando(false);
      return;
    }
    setCarregando(false);
    navigation.replace('Catalogo');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.appName}>Doa<Text style={styles.appNameBold}>Food</Text></Text>
            <Text style={styles.heroTitle}>Bem-vindo de volta!</Text>
            <Text style={styles.heroSub}>Faça login para continuar conectando pessoas e alimentos.</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.formHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>ACESSE SUA CONTA</Text>
              </View>
              <Text style={styles.cardTitle}>Entrar</Text>
            </View>

            {erros.geral ? (
              <View style={styles.alertError}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.erro} style={{ marginRight: 6 }} />
                <Text style={styles.alertText}>{erros.geral}</Text>
              </View>
            ) : null}

            {/* E-mail */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                E-mail <Text style={{ color: colors.laranja }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, erros.email && styles.inputError]}
                placeholder="seuemail@exemplo.com"
                placeholderTextColor={colors.cinza400}
                value={email}
                onChangeText={(v) => { setEmail(v); setErros((p) => ({ ...p, email: '', geral: '' })); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {erros.email ? <Text style={styles.fieldError}>{erros.email}</Text> : null}
            </View>

            {/* Senha */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Senha <Text style={{ color: colors.laranja }}>*</Text>
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex, erros.senha && styles.inputError]}
                  placeholder="Sua senha"
                  placeholderTextColor={colors.cinza400}
                  value={senha}
                  onChangeText={(v) => { setSenha(v); setErros((p) => ({ ...p, senha: '', geral: '' })); }}
                  secureTextEntry={!mostrarSenha}
                />
                <TouchableOpacity
                  style={styles.toggleBtn}
                  onPress={() => setMostrar((p) => !p)}
                >
                  <Ionicons
                    name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.cinza600}
                  />
                </TouchableOpacity>
              </View>
              {erros.senha ? <Text style={styles.fieldError}>{erros.senha}</Text> : null}
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            {/* Botão entrar */}
            <TouchableOpacity
              style={[styles.btnPrimary, carregando && { opacity: 0.65 }]}
              onPress={handleEntrar}
              disabled={carregando}
              activeOpacity={0.85}
            >
              {carregando
                ? <ActivityIndicator color={colors.branco} />
                : <Text style={styles.btnText}>Entrar</Text>}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Cadastro */}
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => navigation.navigate('Cadastro')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnOutlineText}>Criar nova conta</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Ao entrar, você concorda com nossos{' '}
              <Text style={{ color: colors.laranja, fontWeight: '700' }}>Termos de Uso</Text>.
            </Text>

            <View style={styles.demoBox}>
              <Ionicons name="information-circle-outline" size={15} color={colors.cinza600} style={{ marginBottom: 6 }} />
              <View style={styles.demoLinha}>
                <View style={styles.demoBadge}>
                  <Text style={styles.demoBadgeText}>DEMO</Text>
                </View>
                <Text style={styles.demoText}>usuarioteste@doafood.com · teste123</Text>
              </View>
              <View style={styles.demoLinha}>
                <View style={[styles.demoBadge, { backgroundColor: '#ede7f6' }]}>
                  <Text style={[styles.demoBadgeText, { color: '#6a1b9a' }]}>ADMIN</Text>
                </View>
                <Text style={styles.demoText}>admin@doafood.com · admin123</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.verde },
  scroll: { flexGrow: 1 },

  hero: {
    backgroundColor: colors.verde,
    padding: 28,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  appName:      { fontSize: 36, fontWeight: '400', color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  appNameBold:  { fontWeight: '800', color: colors.branco },
  heroTitle:    { fontSize: 22, fontWeight: '800', color: colors.branco, marginBottom: 8, textAlign: 'center' },
  heroSub:      { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

  card: {
    backgroundColor: colors.branco,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    flex: 1,
    padding: 24,
    ...shadow,
  },

  formHeader:  { alignItems: 'center', marginBottom: 24 },
  badge: {
    backgroundColor: colors.laranjaClaro,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: 8,
  },
  badgeText: { color: colors.laranjaEscuro, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  cardTitle: { fontSize: 26, fontWeight: '800', color: colors.cinza900 },

  alertError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdecea',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.erro,
  },
  alertText: { color: colors.erro, fontSize: 13, flex: 1 },

  fieldGroup:  { marginBottom: 14 },
  fieldLabel:  { fontSize: 13, fontWeight: '700', color: colors.cinza900, marginBottom: 6 },
  fieldError:  { fontSize: 12, color: colors.erro, marginTop: 4 },

  input: {
    backgroundColor: colors.cinza100,
    borderWidth: 2,
    borderColor: colors.cinza200,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    color: colors.cinza900,
  },
  inputError: { borderColor: colors.erro, backgroundColor: '#fff8f8' },
  inputFlex:  { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  inputRow:   { flexDirection: 'row', alignItems: 'center' },

  toggleBtn: {
    backgroundColor: colors.cinza100,
    borderWidth: 2,
    borderColor: colors.cinza200,
    borderLeftWidth: 0,
    borderTopRightRadius: radius.md,
    borderBottomRightRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  forgotBtn:  { alignSelf: 'flex-end', marginBottom: 20, marginTop: -6 },
  forgotText: { color: colors.verde, fontSize: 13, fontWeight: '700' },

  btnPrimary: {
    backgroundColor: colors.laranja,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    ...shadow,
  },
  btnText: { color: colors.branco, fontSize: 16, fontWeight: '800' },

  divider:     { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.cinza200 },
  dividerText: { marginHorizontal: 12, color: colors.cinza400, fontSize: 13 },

  btnOutline: {
    borderWidth: 2,
    borderColor: colors.verde,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnOutlineText: { color: colors.verde, fontSize: 15, fontWeight: '800' },

  footerText: { textAlign: 'center', fontSize: 12, color: colors.cinza400, marginTop: 4 },

  demoBox: {
    backgroundColor: colors.cinza100,
    borderRadius: radius.sm,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
    gap: 6,
  },
  demoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoBadge: {
    backgroundColor: colors.laranjaClaro,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 50,
  },
  demoBadgeText: { fontSize: 10, fontWeight: '800', color: colors.laranjaEscuro, letterSpacing: 0.5 },
  demoText: { fontSize: 12, color: colors.cinza600 },
});
