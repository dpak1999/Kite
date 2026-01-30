import React from "react";
import { StyleSheet, TextInput, View, Text } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  placeholder?: string;
  editable?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChangeText,
  error,
  placeholder = "Amount",
  editable = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <Text style={styles.currencySymbol}>₹</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor="#999"
          editable={editable}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    height: 50,
  },
  inputError: {
    borderColor: "tomato",
  },
  currencySymbol: {
    fontSize: RFValue(16),
    fontFamily: "SemiBold",
    color: "#333",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: RFValue(16),
    fontFamily: "Medium",
    color: "#333",
    height: "100%",
  },
  errorText: {
    color: "tomato",
    fontSize: RFValue(12),
    fontFamily: "Regular",
    marginTop: 4,
    marginLeft: 4,
  },
});
