import { SvgUri } from "react-native-svg";
import { TouchableHighlight, View, GestureResponderEvent } from "react-native";

const SVGButton = () => {
    return(
        <TouchableHighlight onPress={onPress}>
        <View width={300} height={200}>
        <SvgUri
            width={300}
            height={200}
            uri="https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/debian.svg"
        />
        </View>
        </TouchableHighlight>            
    )
}
