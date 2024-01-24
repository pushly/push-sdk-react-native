import React, { View } from 'react-native';
import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';

type ColumnViewProps = {
    flex?: number
    style?: ViewProps['style']
    padding?: number,
    children: any
}

export const ColumnView = (props: ColumnViewProps) => (
    <View style={{
        flex: props.flex ?? 0,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: props.padding,
    }}>
        {props.children}
    </View>
)
