import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface Milestone {
  id: string;
  name: string;
  estimatedDuration: number;
  order: number;
}

interface Props {
  milestones: Milestone[];
  onRemove: (id: string) => void;
  minMilestones?: number;
}

export default function MilestonesList({ milestones, onRemove, minMilestones = 3 }: Props) {
  return (
    <View>
      {milestones.length === 0 && <Text>No milestones added.</Text>}
      {milestones.map((m) => (
        <View key={m.id} style={styles.milestoneItem}>
          <Text style={styles.text}>
            {m.order}. {m.name} ({m.estimatedDuration} min)
          </Text>
          <Button
            title="Remove"
            onPress={() => onRemove(m.id)}
            disabled={milestones.length <= minMilestones}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  milestoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  text: { fontSize: 16 },
});
