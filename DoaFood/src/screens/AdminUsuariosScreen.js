import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadowSm } from '../theme';
import { clearSession } from '../services/db';
import { listarUsuarios, excluirUsuario } from '../services/api';

const TIPO_COR = {
  doador:   { fundo: colors.verdeClaro,  texto: colors.verde,   label: 'Doador'   },
  receptor: { fundo: colors.laranjaClaro, texto: colors.laranja, label: 'Receptor' },
  ong:      { fundo: '#f3e5f5',           texto: '#6a1b9a',      label: 'ONG'      },
};

function UserCard({ user, onDelete }) {
  const tipo = TIPO_COR[user.tipoConta] ?? TIPO_COR.doador;
  const documento = user.cnpj
    ? `CNPJ: ${user.cnpj}`
    : user.cpf
      ? `CPF: ${user.cpf}`
      : 'Sem documento';

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetra}>{user.nome?.charAt(0).toUpperCase() || '?'}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.nome} numberOfLines={1}>{user.nome}</Text>
          <View style={[styles.tipoBadge, { backgroundColor: tipo.fundo }]}>
            <Text style={[styles.tipoText, { color: tipo.texto }]}>{tipo.label}</Text>
          </View>
        </View>

        <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
        <Text style={styles.doc}>{documento}</Text>

        <View style={styles.metaRow}>
          {user.telefone ? (
            <Text style={styles.meta}>
              <Ionicons name="call-outline" size={11} color={colors.cinza600} /> {user.telefone}
            </Text>
          ) : null}
          <Text style={styles.meta}>
            <Ionicons name="calendar-outline" size={11} color={colors.cinza600} /> Desde {user.membroDesde}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() =>
          Alert.alert(
            'Excluir usuário',
            `Remover "${user.nome}" do banco de dados?`,
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Excluir', style: 'destructive', onPress: () => onDelete(user.id) },
            ],
          )
        }
      >
        <Ionicons name="trash-outline" size={18} color={colors.erro} />
      </TouchableOpacity>
    </View>
  );
}

export default function AdminUsuariosScreen({ navigation }) {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    try {
      const lista = await listarUsuarios();
      setUsuarios(lista);
    } catch {
      setUsuarios([]);
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(useCallback(() => { carregar(); }, []));

  async function handleDelete(id) {
    await excluirUsuario(id);
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  }

  function handleLimparTudo() {
    Alert.alert(
      'Encerrar sessão',
      'Isso vai encerrar sua sessão de administrador. Confirma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await clearSession();
            navigation.replace('Login');
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.branco} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitulo}>Usuários Cadastrados</Text>
          <Text style={styles.headerSub}>{usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} no banco local</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={carregar}>
          <Ionicons name="refresh-outline" size={22} color={colors.branco} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: colors.laranja, borderRadius: 8, padding: 6 }]}
          onPress={() => navigation.navigate('AdminCriarUsuario')}
        >
          <Ionicons name="person-add-outline" size={20} color={colors.branco} />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.verde} />
        </View>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(u) => u.id}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={colors.cinza400} />
              <Text style={styles.emptyText}>Nenhum usuário encontrado.</Text>
            </View>
          }
          ListFooterComponent={
            usuarios.length > 0 ? (
              <TouchableOpacity style={styles.btnLimpar} onPress={handleLimparTudo} activeOpacity={0.85}>
                <Ionicons name="nuclear-outline" size={18} color={colors.erro} />
                <Text style={styles.btnLimparText}>  Limpar banco de dados</Text>
              </TouchableOpacity>
            ) : null
          }
          renderItem={({ item }) => (
            <UserCard user={item} onDelete={handleDelete} />
          )}
        />
      )}
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
  refreshBtn:   { padding: 4 },
  headerTitulo: { fontSize: 18, fontWeight: '800', color: colors.branco },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  lista: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: colors.branco,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    ...shadowSm,
  },
  cardLeft: {},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.laranja,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetra: { fontSize: 20, fontWeight: '800', color: colors.branco },

  cardBody: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' },
  nome:    { fontSize: 14, fontWeight: '800', color: colors.cinza900, flex: 1 },
  tipoBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50 },
  tipoText:  { fontSize: 10, fontWeight: '800' },

  email: { fontSize: 12, color: colors.cinza600, marginBottom: 2 },
  doc:   { fontSize: 12, color: colors.cinza600, marginBottom: 6 },

  metaRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  meta:    { fontSize: 11, color: colors.cinza400 },

  deleteBtn: {
    padding: 8,
    alignSelf: 'center',
  },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.cinza400 },

  btnLimpar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdecea',
    borderWidth: 2,
    borderColor: colors.erro,
    borderRadius: radius.md,
    paddingVertical: 14,
    marginTop: 8,
  },
  btnLimparText: { color: colors.erro, fontWeight: '800', fontSize: 14 },
});
