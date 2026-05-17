import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme';
import { cadastro as apiCadastro } from '../services/api';

// ── Máscaras ──────────────────────────────────────────────────────────────────
function mascaraCPF(valor) {
  const n = valor.replace(/\D/g, '').slice(0, 11);
  return n
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function mascaraCNPJ(valor) {
  const n = valor.replace(/\D/g, '').slice(0, 14);
  return n
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function mascaraTelefone(valor) {
  const n = valor.replace(/\D/g, '').slice(0, 11);
  if (n.length <= 10) return n.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return n.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

function calcularForca(senha) {
  let pts = 0;
  if (senha.length >= 8)           pts++;
  if (senha.length >= 12)          pts++;
  if (/[A-Z]/.test(senha))         pts++;
  if (/[0-9]/.test(senha))         pts++;
  if (/[^A-Za-z0-9]/.test(senha))  pts++;
  if (pts <= 1) return { nivel: 'Fraca',   cor: colors.erro,    pct: 0.20 };
  if (pts <= 2) return { nivel: 'Regular', cor: colors.laranja,  pct: 0.50 };
  if (pts <= 3) return { nivel: 'Boa',     cor: '#f9a825',       pct: 0.75 };
  return              { nivel: 'Forte',    cor: colors.verde,    pct: 1.00 };
}

function emailValido(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

// ── Componentes internos ───────────────────────────────────────────────────────
function RadioCard({ label, icon, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.radioCard, selected && styles.radioCardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.radioIcon}>{icon}</Text>
      <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>{label}</Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={16} color={colors.verde} style={styles.radioCheck} />
      )}
    </TouchableOpacity>
  );
}

function Campo({ label, required, error, children }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={{ color: colors.laranja }}> *</Text>}
      </Text>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

// ── Tela principal ─────────────────────────────────────────────────────────────
export default function CadastroScreen({ navigation }) {
  // Tipo de conta — selecionado primeiro
  const [tipoConta, setTipoConta] = useState('');

  // Dados pessoais
  const [nome, setNome]         = useState('');
  const [email, setEmail]       = useState('');
  const [documento, setDocumento] = useState(''); // CPF ou CNPJ conforme tipo
  const [telefone, setTelefone] = useState('');

  // Segurança
  const [senha, setSenha]                       = useState('');
  const [confirmar, setConfirmar]               = useState('');
  const [mostrarSenha, setMostrarSenha]         = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // Termos
  const [aceitouTermos, setAceitouTermos] = useState(false);

  // UI
  const [erros, setErros]       = useState({});
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso]   = useState(false);

  const forca   = senha.length > 0 ? calcularForca(senha) : null;
  const isONG   = tipoConta === 'ong';
  const docLabel  = isONG ? 'CNPJ' : 'CPF';
  const docMask   = isONG ? mascaraCNPJ : mascaraCPF;
  const docMax    = isONG ? 18 : 14;
  const docHint   = isONG ? '00.000.000/0001-00' : '000.000.000-00';
  const docRegex  = isONG
    ? /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
    : /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

  function trocarTipo(t) {
    setTipoConta(t);
    setDocumento(''); // reseta documento ao mudar tipo
    setErros((p) => ({ ...p, tipoConta: '', documento: '' }));
  }

  function validar() {
    const e = {};
    if (!tipoConta)               e.tipoConta  = 'Selecione um tipo de conta.';
    if (!nome.trim())             e.nome       = 'Este campo é obrigatório.';
    if (!email.trim())            e.email      = 'Este campo é obrigatório.';
    else if (!emailValido(email)) e.email      = 'Digite um e-mail válido.';
    if (!documento.trim())        e.documento  = 'Este campo é obrigatório.';
    else if (!docRegex.test(documento)) e.documento = `${docLabel} inválido.`;
    if (!senha)                   e.senha      = 'Este campo é obrigatório.';
    else if (senha.length < 8)    e.senha      = 'Mínimo 8 caracteres.';
    if (!confirmar)               e.confirmar  = 'Este campo é obrigatório.';
    else if (senha !== confirmar) e.confirmar  = 'As senhas não coincidem.';
    if (!aceitouTermos)           e.termos     = 'Você precisa aceitar os termos.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleCadastrar() {
    if (!validar()) return;
    setEnviando(true);

    try {
      await apiCadastro({
        nome,
        email,
        cpf:  !isONG ? documento : '',
        cnpj:  isONG ? documento : '',
        telefone,
        tipoConta,
        senha,
      });
      setSucesso(true);
      setTimeout(() => navigation.replace('Login'), 1500);
    } catch (err) {
      Alert.alert('Erro ao cadastrar', err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Cada doação{'\n'}alimenta uma{'\n'}esperança.</Text>
          <Text style={styles.heroSub}>Cadastre-se e conecte quem tem a quem precisa.</Text>
          <View style={styles.heroFeatures}>
            <Text style={styles.heroFeatureItem}>🤝  Doe alimentos localmente</Text>
            <Text style={styles.heroFeatureItem}>📍  Encontre pontos de coleta</Text>
            <Text style={styles.heroFeatureItem}>❤️  Conecte famílias à comida</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.formHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>NOVO POR AQUI?</Text>
            </View>
            <Text style={styles.cardTitle}>Criar conta</Text>
            <Text style={styles.cardSub}>Preencha os dados abaixo para começar a fazer a diferença.</Text>
          </View>

          {/* ── 1. PERFIL DE USO ─── (primeiro para adaptar o formulário) */}
          <Text style={styles.sectionLabel}>PERFIL DE USO</Text>

          <Campo label="Quero me cadastrar como" required error={erros.tipoConta}>
            <View style={styles.radioGroup}>
              <RadioCard label="Doador"   icon="🎁" selected={tipoConta === 'doador'}   onPress={() => trocarTipo('doador')}   />
              <RadioCard label="Receptor" icon="🤲" selected={tipoConta === 'receptor'} onPress={() => trocarTipo('receptor')} />
              <RadioCard label="ONG"      icon="🏢" selected={tipoConta === 'ong'}      onPress={() => trocarTipo('ong')}      />
            </View>
          </Campo>

          {/* ── 2. DADOS PESSOAIS */}
          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>DADOS PESSOAIS</Text>

          <Campo label="Nome completo" required error={erros.nome}>
            <TextInput
              style={[styles.input, erros.nome && styles.inputError]}
              placeholder="Seu nome completo"
              placeholderTextColor={colors.cinza400}
              value={nome}
              onChangeText={(v) => { setNome(v); setErros((p) => ({ ...p, nome: '' })); }}
              autoComplete="name"
            />
          </Campo>

          <Campo label="E-mail" required error={erros.email}>
            <TextInput
              style={[styles.input, erros.email && styles.inputError]}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={colors.cinza400}
              value={email}
              onChangeText={(v) => { setEmail(v); setErros((p) => ({ ...p, email: '' })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </Campo>

          {/* CPF ou CNPJ — adaptado ao tipo selecionado */}
          <Campo label={docLabel} required error={erros.documento}>
            <TextInput
              style={[styles.input, erros.documento && styles.inputError]}
              placeholder={docHint}
              placeholderTextColor={colors.cinza400}
              value={documento}
              onChangeText={(v) => { setDocumento(docMask(v)); setErros((p) => ({ ...p, documento: '' })); }}
              keyboardType="numeric"
              maxLength={docMax}
            />
            {isONG && (
              <Text style={styles.fieldHint}>Para ONGs o cadastro é feito com CNPJ.</Text>
            )}
          </Campo>

          <Campo label="Telefone" error={erros.telefone}>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor={colors.cinza400}
              value={telefone}
              onChangeText={(v) => setTelefone(mascaraTelefone(v))}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </Campo>

          {/* ── 3. SEGURANÇA */}
          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>SEGURANÇA</Text>

          <Campo label="Senha" required error={erros.senha}>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex, erros.senha && styles.inputError]}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor={colors.cinza400}
                value={senha}
                onChangeText={(v) => { setSenha(v); setErros((p) => ({ ...p, senha: '' })); }}
                secureTextEntry={!mostrarSenha}
              />
              <TouchableOpacity style={styles.toggleBtn} onPress={() => setMostrarSenha((p) => !p)}>
                <Ionicons name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.cinza600} />
              </TouchableOpacity>
            </View>
            {forca && (
              <View>
                <View style={styles.strengthBar}>
                  <View style={[styles.strengthFill, { flex: forca.pct, backgroundColor: forca.cor }]} />
                  <View style={{ flex: 1 - forca.pct }} />
                </View>
                <Text style={[styles.strengthLabel, { color: forca.cor }]}>{forca.nivel}</Text>
              </View>
            )}
            <Text style={styles.fieldHint}>Use letras maiúsculas, números e símbolos.</Text>
          </Campo>

          <Campo label="Confirmar senha" required error={erros.confirmar}>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex, erros.confirmar && styles.inputError]}
                placeholder="Repita a senha"
                placeholderTextColor={colors.cinza400}
                value={confirmar}
                onChangeText={(v) => { setConfirmar(v); setErros((p) => ({ ...p, confirmar: '' })); }}
                secureTextEntry={!mostrarConfirmar}
              />
              <TouchableOpacity style={styles.toggleBtn} onPress={() => setMostrarConfirmar((p) => !p)}>
                <Ionicons name={mostrarConfirmar ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.cinza600} />
              </TouchableOpacity>
            </View>
          </Campo>

          {/* ── 4. TERMOS */}
          <View style={styles.termsGroup}>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                onPress={() => { setAceitouTermos((p) => !p); setErros((p) => ({ ...p, termos: '' })); }}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, aceitouTermos && styles.checkboxChecked]}>
                  {aceitouTermos && <Ionicons name="checkmark" size={13} color={colors.branco} />}
                </View>
              </TouchableOpacity>
              <Text style={styles.termsText}>
                Li e aceito os{' '}
                <Text style={styles.termsLink} onPress={() => navigation.navigate('Termos')}>
                  Termos de Uso
                </Text>
                {' '}e a{' '}
                <Text style={styles.termsLink} onPress={() => navigation.navigate('Termos')}>
                  Política de Privacidade
                </Text>.
              </Text>
            </View>
            {erros.termos ? <Text style={styles.fieldError}>{erros.termos}</Text> : null}
          </View>

          {/* ── Botão submit */}
          <TouchableOpacity
            style={[styles.btnPrimary, (enviando || sucesso) && styles.btnDisabled]}
            onPress={handleCadastrar}
            disabled={enviando || sucesso}
            activeOpacity={0.85}
          >
            {enviando ? (
              <ActivityIndicator color={colors.branco} />
            ) : sucesso ? (
              <View style={styles.btnInner}>
                <Ionicons name="checkmark-circle" size={18} color={colors.branco} />
                <Text style={[styles.btnText, { marginLeft: 8 }]}>Conta criada!</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>Criar minha conta</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.loginLink}>
            Já tem uma conta?{' '}
            <Text style={styles.loginLinkBold} onPress={() => navigation.navigate('Login')}>
              Entrar agora
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.cinza100 },
  scroll: { paddingBottom: 40 },

  hero: { backgroundColor: colors.verde, padding: 28, paddingTop: 36 },
  heroTitle:       { fontSize: 28, fontWeight: '800', color: colors.branco, lineHeight: 36, marginBottom: 10 },
  heroSub:         { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  heroFeatures:    { gap: 6 },
  heroFeatureItem: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: 4 },

  card: {
    backgroundColor: colors.branco,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    marginTop: -12,
    padding: 24,
    ...shadow,
  },

  formHeader:  { alignItems: 'center', marginBottom: 24 },
  badge: {
    backgroundColor: colors.laranjaClaro,
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: radius.full, marginBottom: 8,
  },
  badgeText: { color: colors.laranjaEscuro, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  cardTitle: { fontSize: 26, fontWeight: '800', color: colors.cinza900, marginBottom: 4 },
  cardSub:   { color: colors.cinza600, fontSize: 13, textAlign: 'center' },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', letterSpacing: 1.5,
    color: colors.cinza600, marginBottom: 12,
    borderBottomWidth: 1, borderBottomColor: colors.cinza200, paddingBottom: 6,
  },

  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: colors.cinza900, marginBottom: 6 },
  fieldError: { fontSize: 12, color: colors.erro, marginTop: 4 },
  fieldHint:  { fontSize: 12, color: colors.cinza600, marginTop: 4 },

  input: {
    backgroundColor: colors.cinza100,
    borderWidth: 2, borderColor: colors.cinza200,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15, color: colors.cinza900,
  },
  inputError: { borderColor: colors.erro, backgroundColor: '#fff8f8' },
  inputFlex:  { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  inputRow:   { flexDirection: 'row', alignItems: 'center' },

  toggleBtn: {
    backgroundColor: colors.cinza100,
    borderWidth: 2, borderColor: colors.cinza200, borderLeftWidth: 0,
    borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    justifyContent: 'center', alignItems: 'center',
  },

  strengthBar:   { flexDirection: 'row', height: 4, borderRadius: 99, overflow: 'hidden', backgroundColor: colors.cinza200, marginTop: 6 },
  strengthFill:  { borderRadius: 99 },
  strengthLabel: { fontSize: 11, fontWeight: '700', marginTop: 4 },

  radioGroup:         { flexDirection: 'row', gap: 10 },
  radioCard: {
    flex: 1, borderWidth: 2, borderColor: colors.cinza200,
    borderRadius: radius.md, paddingVertical: 12,
    alignItems: 'center', gap: 4,
  },
  radioCardSelected:  { borderColor: colors.verde, backgroundColor: colors.verdeClaro },
  radioIcon:          { fontSize: 22 },
  radioLabel:         { fontSize: 12, fontWeight: '700', color: colors.cinza600, textAlign: 'center' },
  radioLabelSelected: { color: colors.verde },
  radioCheck:         { position: 'absolute', top: 6, right: 6 },

  termsGroup:  { marginBottom: 20 },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 20, height: 20, borderWidth: 2,
    borderColor: colors.cinza400, borderRadius: 4,
    marginTop: 1, alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.verde, borderColor: colors.verde },
  termsText:       { flex: 1, fontSize: 13, color: colors.cinza600, lineHeight: 20 },
  termsLink:       { color: colors.laranja, fontWeight: '700' },

  btnPrimary: {
    backgroundColor: colors.laranja,
    borderRadius: radius.md, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, ...shadow,
  },
  btnDisabled: { opacity: 0.65 },
  btnInner:    { flexDirection: 'row', alignItems: 'center' },
  btnText:     { color: colors.branco, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  loginLink:     { textAlign: 'center', fontSize: 13, color: colors.cinza600 },
  loginLinkBold: { color: colors.verde, fontWeight: '700' },
});
