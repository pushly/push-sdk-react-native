import React, { View } from 'react-native';

type VerticalSpaceProps = {
    space?: number
}

export const VerticalSpace = (props: VerticalSpaceProps) => (
    <View style={{
        flex: (props.space ?? 2) / 100,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    }} />
)
