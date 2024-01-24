import { ColumnView } from './column-view';
import { Text } from 'react-native';
import React from 'react';

type KVViewProps = {
    label: string
    value: string
}

export const KVView = ({ label, value }: KVViewProps) => (
    <ColumnView>
        <Text style={{ ...Styles.text, fontWeight: '700' }}>{label}:</Text>
        <Text style={Styles.text}>{value}</Text>
    </ColumnView>
)

const Styles = {
    text: {
        color: '#333'
    }
}
