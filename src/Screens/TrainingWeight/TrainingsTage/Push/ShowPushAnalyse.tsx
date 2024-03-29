import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { LineChart } from "react-native-chart-kit";
import React, { useEffect, useState } from "react";
import { useMyLoginContext } from "../../../../Provider/LoginProvider";
import { firebasePull } from "../../../../Database/firebaseConfig-Pull";
import {firebasePush} from "../../../../Database/firebaseConfig-Push";

type getParam = {
    route: any;
    navigation: any;
};

const ShowPushAnalyse: React.FC<getParam> = ({ route, navigation }) => {
    const [exerciseNameTitle, setExerciseNameTitle] = useState<string>();
    const {
        username,
    } = useMyLoginContext();
    const [userOneChartData, setUserOneChartData] = useState<any>([1]);
    const [userTwoChartData, setUserTwoChartData] = useState<any>([1]);

    useEffect(() => {
        const { exerciseName } = route.params;
        setExerciseNameTitle(exerciseName);
        getDataForChartOne(username);
        // console.log(getDataForChartOne(username))
        getDataForChartOne('Bumsebiene');
        // console.log(getDataForChartOne('Bumsebiene'))
    }, [exerciseNameTitle]);
    let fetchDBData: any = [];

    const getDataForChartOne = async (nameOfUser: string) => {
        if (exerciseNameTitle != null) {
            const querySnapshot = await firebasePush
                .firestore()
                .collection(nameOfUser)
                .doc(exerciseNameTitle)
                .collection(exerciseNameTitle)
                .orderBy("timestampField", "asc")
                .get();

            const tempDoc = querySnapshot.docs.map((doc: any) => {
                return { id: doc.id, ...doc.data() };
            });

            // console.log(JSON.stringify(tempDoc[0].data))

            for (let i = 0; i < tempDoc.length; i++) {
                fetchDBData[i] = tempDoc[i].data;
            }
            if (fetchDBData) {
                if (nameOfUser === username) {
                    console.log(nameOfUser)
                    console.log(fetchDBData)
                    setUserOneChartData(showResultForOneRepMax(fetchDBData))
                    fetchDBData = []
                } else {
                    console.log(nameOfUser)
                    console.log(fetchDBData)
                    setUserTwoChartData(showResultForOneRepMax(fetchDBData))
                }
            } else {
                console.log("data nicht vorhanden");
            }
        }
    };

    const showResultForOneRepMax = (fetchDBData: any) => {
        let maxWeight: number[] = [];
        let dayCount = 0;
        fetchDBData.forEach((days: any) => {
            maxWeight[dayCount] = 0;
            days.forEach((sets: any) => {
                //Replace comma mit Dot
                sets.kg = sets.kg.replace(/(\d+),(\d+)/g, "$1.$2");
                if (maxWeight[dayCount] < sets.kg && sets.kg) {
                    maxWeight[dayCount] = sets.kg;
                }
            });
            dayCount++;
        });
        // console.log(maxWeight)
        return maxWeight;
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.BackGroundCanvas}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{exerciseNameTitle}</Text>
                </View>
                <View style={styles.lineChartContainer}>
                    <LineChart
                        data={{
                            labels: ["February", "March", "April", "May", "June"],
                            datasets: [
                                {
                                    data: userOneChartData.map(Number),
                                    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                                    strokeWidth: 3,
                                },
                                {
                                    data: userTwoChartData.map(Number),
                                    color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
                                    strokeWidth: 3,
                                },
                            ],
                        }}
                        width={Dimensions.get("window").width} // from react-native
                        height={220}
                        // yAxisLabel="$"
                        yAxisSuffix=" Kg"
                        yAxisInterval={1} // optional, defaults to 1
                        chartConfig={{
                            backgroundColor: "#2d3b55",
                            backgroundGradientFrom: "#2d3b55",
                            backgroundGradientTo: "#2d3b55",
                            decimalPlaces: 1, // optional, defaults to 2dp
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            style: {
                                borderRadius: 16,
                            },
                            propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: "#ffa726",
                            },
                        }}
                        bezier
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                        }}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default ShowPushAnalyse;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#2b3340",
    },
    BackGroundCanvas: {
        flex: 1,
        backgroundColor: "#2d3b55",
        padding: 20,
        borderRadius: 40,
    },
    title: {
        color: "white",
        fontSize: moderateScale(25),
    },
    titleContainer: {
        flex: 0.07,
        justifyContent: "center",
        alignItems: "center",
    },
    lineChartContainer: {
        marginTop: "10%",
    },
});
