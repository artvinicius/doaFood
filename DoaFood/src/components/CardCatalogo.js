import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadowSm } from '../theme';

export default function CardCatalogo({ item, tipo, onPress }) {
  const badgeInfo = {
    doador:   { cor: colors.verde,   fundo: colors.verdeClaro,   texto: 'DOADOR'   },
    receptor: { cor: colors.laranja,  fundo: colors.laranjaClaro, texto: 'RECEPTOR' },
    ong:      { cor: '#6a1b9a',       fundo: '#f3e5f5',           texto: 'ONG'      },
  };
  const badge = badgeInfo[tipo] ?? badgeInfo.doador;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.icone}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
          <View style={[styles.badge, { backgroundColor: badge.fundo }]}>
            <Text style={[styles.badgeText, { color: badge.cor }]}>{badge.texto}</Text>
          </View>
        </View>
        <View style={styles.localRow}>
          <Ionicons name="location-outline" size={12} color={colors.cinza600} />
          <Text style={styles.local} numberOfLines={1}> {item.cidade}, {item.estado}</Text>
        </View>
        <Text style={styles.desc} numberOfLines={2}>{item.descricao}</Text>
        {item.tags?.length > 0 && (
          <View style={styles.tags}>
            {item.tags.slice(0, 3).map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.branco,
    borderRadius: radius.md,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    ...shadowSm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 26 },

  info: { flex: 1 },
  row:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },

  nome: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.cinza900 },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 50,
  },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  localRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  local:    { fontSize: 12, color: colors.cinza600 },
  desc:     { fontSize: 13, color: colors.cinza600, lineHeight: 18 },

  tags:    { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tag:     { backgroundColor: colors.cinza100, borderRadius: 50, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 11, color: colors.cinza600 },
});
