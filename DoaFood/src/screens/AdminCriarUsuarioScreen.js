import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, shadowSm } from '../theme';
import { criarUsuario } from '../services/api';

function mascaraCPF(v) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function mascaraCNPJ(v) {
  return v.replace(/\D/g, '').slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function mascaraTel(v) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

const TIPOS = [
  { key: 'doador',   label: 'Doador',   icon: 'gift-outline',     cor: colors.verde   },
  { key: 'receptor', label: 'Receptor', icon: 'heart-outline',    cor: colors.laranja  },
  { key: 'ong',      label: 'ONG',      icon: 'business-outline', cor: '#6a1b9a'       },
];

export default function AdminCriarUsuarioScreen({ navigation }) {
  const [nome, setNome]           = useState('');
  const [email, setEmail]         = useState('');
  const [senha, setSenha]         = useState('');
  const [mostrarSenha, setMostrar]= useState(false);
  const [tipoConta, setTipo]      = useState('doador');
  const [documento, setDocumento] = useState('');
  const [telefone, setTelefone]   = useState('');
  const [cidade, setCidade]       = useState('');
  const [erros, setErros]         = useState({});
  const [salvando, setSalvando]   = useState(false);

  const isONG    = tipoConta === 'ong';
  const docLabel = isONG ? 'CNPJ' : 'CPF';
  const docMax   = isONG ? 18 : 14;
  const docMask  = isONG ? mascaraCNPJ : mascaraCPF;
  const docRegex = isONG
    ? /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
    : /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

  function trocarTipo(t) {
    setTipo(t);
    setDocumento('');
    setErros((p) => ({ ...p, documento: '' }));
  }

  function validar() {
    const e = {};
    if (!nome.trim())  e.nome  = 'Informe o nome.';
    if (!email.trim()) e.email = 'Informe o e-mail.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido.';
    if (!senha)        e.senha = 'Informe a senha.';
    else if (senha.length < 6) e.senha = 'Mínimo 6 caracteres.';
    if (documento && !docRegex.test(documento)) e.documento = `${docLabel} inválido.`;
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleSalvar() {
    if (!validar()) return;
    setSalvando(true);
    try {
      await criarUsuario({
        nome:      nome.trim(),
        email:     email.trim().toLowerCase(),
        senha,
        tipoConta,
        cpf:       !isONG ? documento : '',
        cnpj:      isONG  ? documento : '',
        telefone,
        cidade:    cidade.trim(),
        isAdmin:   false,
      });
      Alert.alert('Sucesso', `Usuário "${nome.trim()}" criado com sucesso!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setErros({ geral: err.message });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.branco} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitulo}>Criar Usuário</Text>
          <Text style={styles.headerSub}>Painel administrativo</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Erro geral */}
        {erros.geral ? (
          <View style={styles.alertError}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.erro} style={{ marginRight: 6 }} />
            <Text style={styles.alertText}>{erros.geral}</Text>
          </View>
        ) : null}

        {/* Tipo de conta */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>TIPO DE CONTA</Text>
          <View style={styles.tiposRow}>
            {TIPOS.map((t) => {
              const ativo = tipoConta === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.tipoCard, ativo && { borderColor: t.cor, backgroundColor: t.cor + '12' }]}
                  onPress={() => trocarTipo(t.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={ativo ? 'checkmark-circle' : t.icon} size={20} color={ativo ? t.cor : colors.cinza400} />
                  <Text style={[styles.tipoLabel, ativo && { color: t.cor, fontWeight: '800' }]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dados pessoais */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>DADOS PESSOAIS</Text>
          <View style={styles.card}>

            {/* Nome */}
            <View style={styles.field}>
              <Text style={styles.label}>Nome <Text style={{ color: colors.laranja }}>*</Text></Text>
              <TextInput
                style={[styles.input, erros.nome && styles.inputError]}
                placeholder="Nome completo ou razão social"
                placeholderTextColor={colors.cinza400}
                value={nome}
                onChangeText={(v) => { setNome(v); setErros((p) => ({ ...p, nome: '' })); }}
              />
              {erros.nome ? <Text style={styles.fieldError}>{erros.nome}</Text> : null}
            </View>

            {/* E-mail */}
            <View style={styles.field}>
              <Text style={styles.label}>E-mail <Text style={{ color: colors.laranja }}>*</Text></Text>
              <TextInput
                style={[styles.input, erros.email && styles.inputError]}
                placeholder="email@exemplo.com"
                placeholderTextColor={colors.cinza400}
                value={email}
                onChangeText={(v) => { setEmail(v); setErros((p) => ({ ...p, email: '', geral: '' })); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {erros.email ? <Text style={styles.fieldError}>{erros.email}</Text> : null}
            </View>

            {/* Senha */}
            <View style={styles.field}>
              <Text style={styles.label}>Senha <Text style={{ color: colors.laranja }}>*</Text></Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex, erros.senha && styles.inputError]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.cinza400}
                  value={senha}
                  onChangeText={(v) => { setSenha(v); setErros((p) => ({ ...p, senha: '' })); }}
                  secureTextEntry={!mostrarSenha}
                />
                <TouchableOpacity style={styles.toggleBtn} onPress={() => setMostrar((p) => !p)}>
                  <Ionicons name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.cinza600} />
                </TouchableOpacity>
              </View>
              {erros.senha ? <Text style={styles.fieldError}>{erros.senha}</Text> : null}
            </View>

            {/* CPF / CNPJ */}
            <View style={styles.field}>
              <Text style={styles.label}>{docLabel} <Text style={{ color: colors.cinza400, fontWeight: '400' }}>(opcional)</Text></Text>
              <TextInput
                style={[styles.input, erros.documento && styles.inputError]}
                placeholder={isONG ? '00.000.000/0001-00' : '000.000.000-00'}
                placeholderTextColor={colors.cinza400}
                value={documento}
                onChangeText={(v) => { setDocumento(docMask(v)); setErros((p) => ({ ...p, documento: '' })); }}
                keyboardType="numeric"
                maxLength={docMax}
              />
              {erros.documento ? <Text style={styles.fieldError}>{erros.documento}</Text> : null}
            </View>

            {/* Telefone */}
            <View style={styles.field}>
              <Text style={styles.label}>Telefone <Text style={{ color: colors.cinza400, fontWeight: '400' }}>(opcional)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="(11) 99999-0000"
                placeholderTextColor={colors.cinza400}
                value={telefone}
                onChangeText={(v) => setTelefone(mascaraTel(v))}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            {/* Cidade */}
            <View style={[styles.field, { marginBottom: 0 }]}>
              <Text style={styles.label}>Cidade <Text style={{ color: colors.cinza400, fontWeight: '400' }}>(opcional)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="São Paulo, SP"
                placeholderTextColor={colors.cinza400}
                value={cidade}
                onChangeText={setCidade}
              />
            </View>
          </View>
        </View>

        {/* Botão salvar */}
        <TouchableOpacity
          style={[styles.btnSalvar, salvando && { opacity: 0.65 }]}
          onPress={handleSalvar}
          disabled={salvando}
          activeOpacity={0.85}
        >
          {salvando
            ? <ActivityIndicator color={colors.branco} />
            : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.branco} />
                <Text style={styles.btnSalvarText}>Criar Usuário</Text>
              </>
            )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cinza100 },

  header: {
    backgroundColor: colors.verde,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 24,
    gap: 12,
  },
  voltarBtn:    { padding: 4 },
  headerTitulo: { fontSize: 18, fontWeight: '800', color: colors.branco },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  scroll: { padding: 16, paddingBottom: 40 },

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

  secao:       { marginBottom: 16 },
  secaoTitulo: {
    fontSize: 11, fontWeight: '800', letterSpacing: 1.5,
    color: colors.cinza600, marginBottom: 8,
  },

  tiposRow: { flexDirection: 'row', gap: 8 },
  tipoCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.cinza200,
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.branco,
    ...shadowSm,
  },
  tipoLabel: { fontSize: 12, fontWeight: '600', color: colors.cinza600 },

  card: {
    backgroundColor: colors.branco,
    borderRadius: radius.md,
    padding: 16,
    ...shadowSm,
  },

  field:      { marginBottom: 14 },
  label:      { fontSize: 13, fontWeight: '700', color: colors.cinza900, marginBottom: 6 },
  fieldError: { fontSize: 12, color: colors.erro, marginTop: 4 },

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

  btnSalvar: {
    backgroundColor: colors.verde,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    ...shadow,
  },
  btnSalvarText: { color: colors.branco, fontSize: 16, fontWeight: '800' },
});
