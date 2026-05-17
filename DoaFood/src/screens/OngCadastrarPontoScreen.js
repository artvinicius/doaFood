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
import { criarPontoColeta } from '../services/api';

function mascaraTel(v) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export default function OngCadastrarPontoScreen({ navigation }) {
  const [nome, setNome]         = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade]     = useState('');
  const [estado, setEstado]     = useState('');
  const [telefone, setTelefone] = useState('');
  const [horario, setHorario]   = useState('');
  const [erros, setErros]       = useState({});
  const [salvando, setSalvando] = useState(false);

  function validar() {
    const e = {};
    if (!nome.trim())     e.nome     = 'Informe o nome do ponto.';
    if (!endereco.trim()) e.endereco = 'Informe o endereço.';
    if (!cidade.trim())   e.cidade   = 'Informe a cidade.';
    if (!estado.trim())   e.estado   = 'Informe o estado (ex: SP).';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleSalvar() {
    if (!validar()) return;
    setSalvando(true);
    try {
      await criarPontoColeta({
        nome:     nome.trim(),
        endereco: endereco.trim(),
        cidade:   cidade.trim(),
        estado:   estado.trim().toUpperCase(),
        telefone,
        horario:  horario.trim(),
      });
      Alert.alert('Sucesso', 'Ponto de coleta cadastrado com sucesso!', [
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.branco} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitulo}>Cadastrar Ponto de Coleta</Text>
          <Text style={styles.headerSub}>Visível para todos os usuários</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {erros.geral ? (
          <View style={styles.alertError}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.erro} style={{ marginRight: 6 }} />
            <Text style={styles.alertText}>{erros.geral}</Text>
          </View>
        ) : null}

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>INFORMAÇÕES DO PONTO</Text>
          <View style={styles.card}>

            <View style={styles.field}>
              <Text style={styles.label}>Nome do ponto <Text style={{ color: colors.laranja }}>*</Text></Text>
              <TextInput
                style={[styles.input, erros.nome && styles.inputError]}
                placeholder="Ex: Central de Doações da Esperança"
                placeholderTextColor={colors.cinza400}
                value={nome}
                onChangeText={(v) => { setNome(v); setErros((p) => ({ ...p, nome: '' })); }}
              />
              {erros.nome ? <Text style={styles.fieldError}>{erros.nome}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Endereço <Text style={{ color: colors.laranja }}>*</Text></Text>
              <TextInput
                style={[styles.input, erros.endereco && styles.inputError]}
                placeholder="Rua, número, bairro"
                placeholderTextColor={colors.cinza400}
                value={endereco}
                onChangeText={(v) => { setEndereco(v); setErros((p) => ({ ...p, endereco: '' })); }}
              />
              {erros.endereco ? <Text style={styles.fieldError}>{erros.endereco}</Text> : null}
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Cidade <Text style={{ color: colors.laranja }}>*</Text></Text>
                <TextInput
                  style={[styles.input, erros.cidade && styles.inputError]}
                  placeholder="São Paulo"
                  placeholderTextColor={colors.cinza400}
                  value={cidade}
                  onChangeText={(v) => { setCidade(v); setErros((p) => ({ ...p, cidade: '' })); }}
                />
                {erros.cidade ? <Text style={styles.fieldError}>{erros.cidade}</Text> : null}
              </View>

              <View style={[styles.field, { width: 80 }]}>
                <Text style={styles.label}>Estado <Text style={{ color: colors.laranja }}>*</Text></Text>
                <TextInput
                  style={[styles.input, erros.estado && styles.inputError]}
                  placeholder="SP"
                  placeholderTextColor={colors.cinza400}
                  value={estado}
                  onChangeText={(v) => { setEstado(v); setErros((p) => ({ ...p, estado: '' })); }}
                  maxLength={2}
                  autoCapitalize="characters"
                />
                {erros.estado ? <Text style={styles.fieldError}>{erros.estado}</Text> : null}
              </View>
            </View>

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

            <View style={[styles.field, { marginBottom: 0 }]}>
              <Text style={styles.label}>Horário de funcionamento <Text style={{ color: colors.cinza400, fontWeight: '400' }}>(opcional)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Seg–Sex 08h–18h"
                placeholderTextColor={colors.cinza400}
                value={horario}
                onChangeText={setHorario}
              />
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.verde} />
          <Text style={styles.infoText}>
            Após cadastrado, seu ponto ficará visível para todos os usuários do DoaFood.
          </Text>
        </View>

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
                <Ionicons name="location-outline" size={20} color={colors.branco} />
                <Text style={styles.btnSalvarText}>Cadastrar Ponto</Text>
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
    backgroundColor: '#6a1b9a',
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

  card: {
    backgroundColor: colors.branco,
    borderRadius: radius.md,
    padding: 16,
    ...shadowSm,
  },

  row:  { flexDirection: 'row', gap: 10 },
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

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.verdeClaro,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  infoText: { flex: 1, fontSize: 13, color: colors.verde, lineHeight: 18 },

  btnSalvar: {
    backgroundColor: '#6a1b9a',
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    ...shadow,
  },
  btnSalvarText: { color: colors.branco, fontSize: 16, fontWeight: '800' },
});
