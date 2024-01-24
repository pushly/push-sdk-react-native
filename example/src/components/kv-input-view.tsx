import { ColumnView } from './column-view';
import { type StyleProp, Text, TextInput, type TextInputProps, type TextStyle } from 'react-native';
import React from 'react';

type KVViewProps = {
    label: string
    defaultValue: TextInputProps['defaultValue']
    onChange: TextInputProps['onChangeText']
}

export const KVInputView = ({ label, defaultValue, onChange }: KVViewProps) => (
    <ColumnView>
        <Text style={{ ...Styles.text, fontWeight: '700' }}>{label}:</Text>
        <TextInput
            style={Styles.input}
            defaultValue={defaultValue}
            onChangeText={(value) => {
                onChange?.(value)
            }}
        />
    </ColumnView>
)

const Styles = {
    text: {
        color: '#333'
    },
    input: {
        width: 300,
        paddingVertical: 6,
        paddingHorizontal: 8,
        color: '#333',
        borderStyle: 'solid',
        borderColor: '#888',
        borderWidth: 1,
        borderRadius: 4,
    } as StyleProp<TextStyle>
}
