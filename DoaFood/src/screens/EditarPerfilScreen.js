import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, shadowSm } from '../theme';
import { getSession, setSession, clearSession } from '../services/db';
import { atualizarUsuario, excluirUsuario } from '../services/api';

function mascaraTelefone(valor) {
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 10)
    return nums.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return nums.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
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

export default function EditarPerfilScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);

  // Campos editáveis
  const [nome, setNome]         = useState('');
  const [email, setEmail]       = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade]     = useState('');

  // Troca de senha
  const [senhaAtual, setSenhaAtual]       = useState('');
  const [novaSenha, setNovaSenha]         = useState('');
  const [confirmarNova, setConfirmarNova] = useState('');
  const [mostrarAtual, setMostrarAtual]   = useState(false);
  const [mostrarNova, setMostrarNova]     = useState(false);
  const [mostrarConf, setMostrarConf]     = useState(false);
  const [trocandoSenha, setTrocandoSenha] = useState(false);

  const [erros, setErros]       = useState({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    getSession().then((u) => {
      if (!u) { navigation.replace('Login'); return; }
      setUsuario(u);
      setNome(u.nome ?? '');
      setEmail(u.email ?? '');
      setTelefone(u.telefone ?? '');
      setCidade(u.cidade ?? '');
    });
  }, []);

  function validarDados() {
    const e = {};
    if (!nome.trim()) e.nome = 'Nome é obrigatório.';
    if (!email.trim()) e.email = 'E-mail é obrigatório.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido.';
    setErros((p) => ({ ...p, ...e }));
    return Object.keys(e).length === 0;
  }

  function validarSenha() {
    const e = {};
    if (!senhaAtual) e.senhaAtual = 'Informe a senha atual.';
    if (!novaSenha) e.novaSenha = 'Informe a nova senha.';
    else if (novaSenha.length < 8) e.novaSenha = 'Mínimo de 8 caracteres.';
    if (novaSenha !== confirmarNova) e.confirmarNova = 'As senhas não coincidem.';
    setErros((p) => ({ ...p, ...e }));
    return Object.keys(e).length === 0;
  }

  async function handleSalvar() {
    if (!validarDados()) return;
    setSalvando(true);
    try {
      const atualizado = await atualizarUsuario(usuario.id, { nome, email, telefone, cidade });
      await setSession(atualizado);
      setUsuario(atualizado);
      Alert.alert('Salvo!', 'Seu perfil foi atualizado com sucesso.');
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function handleTrocarSenha() {
    if (!validarSenha()) return;
    setSalvando(true);
    try {
      await atualizarUsuario(usuario.id, { senhaAtual, novaSenha });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNova('');
      setTrocandoSenha(false);
      Alert.alert('Senha alterada!', 'Sua senha foi atualizada com sucesso.');
    } catch (err) {
      setErros((p) => ({ ...p, senhaAtual: err.message }));
    } finally {
      setSalvando(false);
    }
  }

  function handleExcluirConta() {
    Alert.alert(
      'Excluir conta',
      'Esta ação é irreversível. Todos os seus dados serão apagados permanentemente. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirUsuario(usuario.id);
              await clearSession();
              navigation.replace('Login');
            } catch (err) {
              Alert.alert('Erro', err.message);
            }
          },
        },
      ],
    );
  }

  if (!usuario) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.verde} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.branco} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Editar Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Avatar */}
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetra}>{nome.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <View>
            <Text style={styles.avatarNome}>{nome || 'Seu nome'}</Text>
            <Text style={styles.avatarTipo}>{usuario.tipoConta?.toUpperCase()}</Text>
          </View>
        </View>

        {/* ── Dados pessoais ─────────────────────────────────────────────── */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>DADOS PESSOAIS</Text>
          <View style={styles.card}>

            <Campo label="Nome completo" required error={erros.nome}>
              <TextInput
                style={[styles.input, erros.nome && styles.inputError]}
                value={nome}
                onChangeText={(v) => { setNome(v); setErros((p) => ({ ...p, nome: '' })); }}
                placeholder="Seu nome completo"
                placeholderTextColor={colors.cinza400}
              />
            </Campo>

            <Campo label="E-mail" required error={erros.email}>
              <TextInput
                style={[styles.input, erros.email && styles.inputError]}
                value={email}
                onChangeText={(v) => { setEmail(v); setErros((p) => ({ ...p, email: '' })); }}
                placeholder="seuemail@exemplo.com"
                placeholderTextColor={colors.cinza400}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Campo>

            <Campo label="Telefone" error={erros.telefone}>
              <TextInput
                style={styles.input}
                value={telefone}
                onChangeText={(v) => setTelefone(mascaraTelefone(v))}
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.cinza400}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </Campo>

            <Campo label="Cidade" error={erros.cidade}>
              <TextInput
                style={styles.input}
                value={cidade}
                onChangeText={setCidade}
                placeholder="Cidade, UF"
                placeholderTextColor={colors.cinza400}
              />
            </Campo>

            <TouchableOpacity
              style={[styles.btnSalvar, salvando && { opacity: 0.65 }]}
              onPress={handleSalvar}
              disabled={salvando}
              activeOpacity={0.85}
            >
              {salvando
                ? <ActivityIndicator color={colors.branco} />
                : (
                  <View style={styles.btnInner}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.branco} />
                    <Text style={styles.btnText}>  Salvar alterações</Text>
                  </View>
                )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Segurança / Trocar senha ────────────────────────────────────── */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>SEGURANÇA</Text>
          <View style={styles.card}>
            {!trocandoSenha ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setTrocandoSenha(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="lock-closed-outline" size={20} color={colors.cinza600} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuTitulo}>Alterar senha</Text>
                  <Text style={styles.menuSub}>Defina uma nova senha de acesso</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.cinza400} />
              </TouchableOpacity>
            ) : (
              <View>
                <Campo label="Senha atual" error={erros.senhaAtual}>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, styles.inputFlex, erros.senhaAtual && styles.inputError]}
                      value={senhaAtual}
                      onChangeText={(v) => { setSenhaAtual(v); setErros((p) => ({ ...p, senhaAtual: '' })); }}
                      secureTextEntry={!mostrarAtual}
                      placeholder="Sua senha atual"
                      placeholderTextColor={colors.cinza400}
                    />
                    <TouchableOpacity style={styles.toggleBtn} onPress={() => setMostrarAtual((p) => !p)}>
                      <Ionicons name={mostrarAtual ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.cinza600} />
                    </TouchableOpacity>
                  </View>
                </Campo>

                <Campo label="Nova senha" error={erros.novaSenha}>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, styles.inputFlex, erros.novaSenha && styles.inputError]}
                      value={novaSenha}
                      onChangeText={(v) => { setNovaSenha(v); setErros((p) => ({ ...p, novaSenha: '' })); }}
                      secureTextEntry={!mostrarNova}
                      placeholder="Mínimo 8 caracteres"
                      placeholderTextColor={colors.cinza400}
                    />
                    <TouchableOpacity style={styles.toggleBtn} onPress={() => setMostrarNova((p) => !p)}>
                      <Ionicons name={mostrarNova ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.cinza600} />
                    </TouchableOpacity>
                  </View>
                </Campo>

                <Campo label="Confirmar nova senha" error={erros.confirmarNova}>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, styles.inputFlex, erros.confirmarNova && styles.inputError]}
                      value={confirmarNova}
                      onChangeText={(v) => { setConfirmarNova(v); setErros((p) => ({ ...p, confirmarNova: '' })); }}
                      secureTextEntry={!mostrarConf}
                      placeholder="Repita a nova senha"
                      placeholderTextColor={colors.cinza400}
                    />
                    <TouchableOpacity style={styles.toggleBtn} onPress={() => setMostrarConf((p) => !p)}>
                      <Ionicons name={mostrarConf ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.cinza600} />
                    </TouchableOpacity>
                  </View>
                </Campo>

                <View style={styles.botoesRow}>
                  <TouchableOpacity
                    style={[styles.btnCancelar, { flex: 1 }]}
                    onPress={() => { setTrocandoSenha(false); setSenhaAtual(''); setNovaSenha(''); setConfirmarNova(''); setErros({}); }}
                  >
                    <Text style={styles.btnCancelarText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btnSalvar, { flex: 2 }, salvando && { opacity: 0.65 }]}
                    onPress={handleTrocarSenha}
                    disabled={salvando}
                    activeOpacity={0.85}
                  >
                    {salvando
                      ? <ActivityIndicator color={colors.branco} />
                      : (
                        <View style={styles.btnInner}>
                          <Ionicons name="shield-checkmark-outline" size={16} color={colors.branco} />
                          <Text style={styles.btnText}>  Salvar senha</Text>
                        </View>
                      )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── Zona de perigo ─────────────────────────────────────────────── */}
        <View style={[styles.secao, { marginBottom: 40 }]}>
          <Text style={[styles.secaoTitulo, { color: colors.erro }]}>ZONA DE PERIGO</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem} onPress={handleExcluirConta} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={20} color={colors.erro} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitulo, { color: colors.erro }]}>Excluir conta</Text>
                <Text style={styles.menuSub}>Remove permanentemente seus dados</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.erro} />
            </TouchableOpacity>
          </View>
        </View>
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

  conteudo: { padding: 16 },

  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.branco,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 16,
    ...shadowSm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.laranja,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetra: { fontSize: 28, fontWeight: '800', color: colors.branco },
  avatarNome:  { fontSize: 16, fontWeight: '800', color: colors.cinza900 },
  avatarTipo:  { fontSize: 11, fontWeight: '700', color: colors.cinza600, letterSpacing: 1, marginTop: 2 },

  secao:       { marginBottom: 16 },
  secaoTitulo: {
    fontSize: 11, fontWeight: '800', letterSpacing: 1.5,
    color: colors.cinza600, marginBottom: 8,
  },
  card: {
    backgroundColor: colors.branco,
    borderRadius: radius.md,
    padding: 16,
    ...shadowSm,
  },

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

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  menuTitulo: { fontSize: 14, fontWeight: '700', color: colors.cinza900 },
  menuSub:    { fontSize: 12, color: colors.cinza400, marginTop: 2 },

  botoesRow: { flexDirection: 'row', gap: 10, marginTop: 4 },

  btnSalvar: {
    backgroundColor: colors.verde,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...shadow,
  },
  btnInner: { flexDirection: 'row', alignItems: 'center' },
  btnText:  { color: colors.branco, fontWeight: '800', fontSize: 14 },

  btnCancelar: {
    borderWidth: 2,
    borderColor: colors.cinza200,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnCancelarText: { color: colors.cinza600, fontWeight: '700', fontSize: 14 },
});
