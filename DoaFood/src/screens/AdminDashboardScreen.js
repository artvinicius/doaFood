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
import { listarUsuarios, excluirUsuario, getPontosColeta, excluirPontoColeta } from '../services/api';

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
      <View style={styles.avatar}>
        <Text style={styles.avatarLetra}>{user.nome?.charAt(0).toUpperCase() || '?'}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.nome} numberOfLines={1}>{user.nome}</Text>
          <View style={[styles.badge, { backgroundColor: tipo.fundo }]}>
            <Text style={[styles.badgeText, { color: tipo.texto }]}>{tipo.label}</Text>
          </View>
        </View>
        <Text style={styles.sub} numberOfLines={1}>{user.email}</Text>
        <Text style={styles.sub}>{documento}</Text>
        {user.cidade ? <Text style={styles.meta}>{user.cidade} · Desde {user.membroDesde}</Text> : null}
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

function PontoCard({ ponto, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: colors.verdeClaro }]}>
        <Ionicons name="location-outline" size={22} color={colors.verde} />
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.nome} numberOfLines={1}>{ponto.nome}</Text>
        <Text style={styles.sub}>{ponto.endereco}</Text>
        <Text style={styles.meta}>{ponto.cidade}, {ponto.estado}</Text>
        {ponto.horario ? <Text style={styles.meta}>{ponto.horario}</Text> : null}
        {ponto.ongId ? (
          <View style={[styles.badge, { backgroundColor: '#f3e5f5', alignSelf: 'flex-start', marginTop: 4 }]}>
            <Text style={[styles.badgeText, { color: '#6a1b9a' }]}>Cadastrado por ONG</Text>
          </View>
        ) : (
          <View style={[styles.badge, { backgroundColor: colors.verdeClaro, alignSelf: 'flex-start', marginTop: 4 }]}>
            <Text style={[styles.badgeText, { color: colors.verde }]}>Seed do sistema</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() =>
          Alert.alert(
            'Excluir ponto',
            `Remover "${ponto.nome}" do banco de dados?`,
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Excluir', style: 'destructive', onPress: () => onDelete(ponto.id) },
            ],
          )
        }
      >
        <Ionicons name="trash-outline" size={18} color={colors.erro} />
      </TouchableOpacity>
    </View>
  );
}

export default function AdminDashboardScreen({ navigation }) {
  const [tabAtiva, setTabAtiva]       = useState('usuarios');
  const [usuarios, setUsuarios]       = useState([]);
  const [pontos, setPontos]           = useState([]);
  const [carregando, setCarregando]   = useState(true);

  async function carregar() {
    setCarregando(true);
    try {
      const [listaU, listaP] = await Promise.all([listarUsuarios(), getPontosColeta()]);
      setUsuarios(listaU);
      setPontos(listaP);
    } catch {
      setUsuarios([]);
      setPontos([]);
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(useCallback(() => { carregar(); }, []));

  async function handleDeleteUsuario(id) {
    await excluirUsuario(id);
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  }

  async function handleDeletePonto(id) {
    await excluirPontoColeta(id);
    setPontos((prev) => prev.filter((p) => p.id !== id));
  }

  function handleSair() {
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

  const dadosAtivos = tabAtiva === 'usuarios' ? usuarios : pontos;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.branco} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitulo}>Painel Administrativo</Text>
          <Text style={styles.headerSub}>
            {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} · {pontos.length} ponto{pontos.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={carregar}>
          <Ionicons name="refresh-outline" size={22} color={colors.branco} />
        </TouchableOpacity>
        {tabAtiva === 'usuarios' && (
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.laranja, borderRadius: 8, padding: 6 }]}
            onPress={() => navigation.navigate('AdminCriarUsuario')}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.branco} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tabAtiva === 'usuarios' && styles.tabAtiva]}
          onPress={() => setTabAtiva('usuarios')}
        >
          <Ionicons name="people-outline" size={16} color={tabAtiva === 'usuarios' ? colors.verde : colors.cinza600} />
          <Text style={[styles.tabText, tabAtiva === 'usuarios' && styles.tabTextAtivo]}>
            Usuários ({usuarios.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tabAtiva === 'pontos' && styles.tabAtiva]}
          onPress={() => setTabAtiva('pontos')}
        >
          <Ionicons name="location-outline" size={16} color={tabAtiva === 'pontos' ? colors.verde : colors.cinza600} />
          <Text style={[styles.tabText, tabAtiva === 'pontos' && styles.tabTextAtivo]}>
            Pontos de Coleta ({pontos.length})
          </Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.verde} />
        </View>
      ) : (
        <FlatList
          key={tabAtiva}
          data={dadosAtivos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name={tabAtiva === 'usuarios' ? 'people-outline' : 'location-outline'}
                size={48}
                color={colors.cinza400}
              />
              <Text style={styles.emptyText}>
                {tabAtiva === 'usuarios' ? 'Nenhum usuário encontrado.' : 'Nenhum ponto cadastrado.'}
              </Text>
            </View>
          }
          ListFooterComponent={
            dadosAtivos.length > 0 ? (
              <TouchableOpacity style={styles.btnSair} onPress={handleSair} activeOpacity={0.85}>
                <Ionicons name="log-out-outline" size={18} color={colors.erro} />
                <Text style={styles.btnSairText}>  Encerrar sessão admin</Text>
              </TouchableOpacity>
            ) : null
          }
          renderItem={({ item }) =>
            tabAtiva === 'usuarios'
              ? <UserCard user={item} onDelete={handleDeleteUsuario} />
              : <PontoCard ponto={item} onDelete={handleDeletePonto} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cinza100 },

  header: {
    backgroundColor: '#4a148c',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 24,
    gap: 12,
  },
  voltarBtn:    { padding: 4 },
  iconBtn:      { padding: 4 },
  headerTitulo: { fontSize: 18, fontWeight: '800', color: colors.branco },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.branco,
    borderBottomWidth: 1,
    borderBottomColor: colors.cinza200,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabAtiva:      { borderBottomColor: colors.verde },
  tabText:       { fontSize: 13, fontWeight: '700', color: colors.cinza600 },
  tabTextAtivo:  { color: colors.verde },

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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.laranja,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetra: { fontSize: 20, fontWeight: '800', color: colors.branco },

  cardBody:   { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' },
  nome:       { fontSize: 14, fontWeight: '800', color: colors.cinza900, flex: 1 },
  badge:      { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50 },
  badgeText:  { fontSize: 10, fontWeight: '800' },
  sub:        { fontSize: 12, color: colors.cinza600, marginBottom: 2 },
  meta:       { fontSize: 11, color: colors.cinza400 },

  deleteBtn: { padding: 8, alignSelf: 'center' },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.cinza400 },

  btnSair: {
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
  btnSairText: { color: colors.erro, fontWeight: '800', fontSize: 14 },
});
