import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  tabs: readonly string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

/**
 * Tab bar with underline style matching the Figma design.
 * Active tab has blue text with a blue bottom border.
 * Inactive tab has gray text with no border.
 */
export function SegmentedControl({ tabs, selectedIndex, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable
            key={tab}
            style={[styles.tab, isSelected && styles.tabSelected]}
            onPress={() => onSelect(index)}
            accessibilityRole="tab"
            accessibilityLabel={tab}
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.cardBackground,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabSelected: {
    borderBottomColor: Colors.primaryBlue,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  tabTextSelected: {
    color: Colors.primaryBlue,
    fontWeight: '600',
  },
});
