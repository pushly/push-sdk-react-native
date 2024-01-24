import { Pressable, type PressableProps, type StyleProp, Text, type ViewStyle } from 'react-native'
import * as React from 'react'

type ButtonViewProps = Exclude<PressableProps, 'style'> & {
    label: string
}

export const ButtonView = ({ label, ...props }: ButtonViewProps) => {
    return (
        <Pressable
            {...props}
            style={props.disabled ? Styles.buttonDisabled : Styles.button}
        >
            <Text style={{ color: '#fff' }}>
                {label}
            </Text>
        </Pressable>
    )
}

const Styles = {
    button: {
        elevation: 2,
        backgroundColor: '#4dbca2',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 4,
    } as StyleProp<ViewStyle>,
    buttonDisabled: {
        elevation: 2,
        backgroundColor: '#888',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 4,
        opacity: 0.24,
    } as StyleProp<ViewStyle>,
}
