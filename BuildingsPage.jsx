import React, {useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    Image, 
    SafeAreaView, 
    ImageBackground
} from 'react-native';
import ReactNativeModal from "react-native-modal";
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import SQLite from 'react-native-sqlite-storage';
import { updateBalance } from '../src/slices/bsaSlice';

const db = SQLite.openDatabase("bsa.db")

const BuildingsPage = () => {
    const updatedBalance = useSelector((state) => state.user.balance)
    const dispatch = useDispatch()
    const navigation = useNavigation()
    const [buildingName, setbuildingName] = useState('')
    const [buildingPrice, setbuildingPrice] = useState('')
    const [buildingId, setBuildingId] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [buildingData, setBuildingData] = useState([])

    useEffect(() => {
        getValues()
    }, [])

    const getValues = () => {
        try {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM buildings',
                    [],
                    (tx, results) => {
                        const len = results.rows.length;
                        let temp = []
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            temp.push(row)
                        }
                        setBuildingData(temp)
                    },
                    (error) => {
                        console.log('Error getting data:', error);
                    }
                );
            });
        } catch {
            console.log("getValues Error ")
        }
    }


    const recomputeBalance = () => {
        let finalBalance = parseInt(updatedBalance) - parseInt(buildingPrice)
        dispatch(updateBalance({ 'price': finalBalance, 'updateBalanceDB': true }))
    }

    const buyNow = () => {
        if (updatedBalance < buildingPrice){
            Toast.show({
                type: 'error',
                text1: 'Insufficient Balance.',
                autoHide: true,
                visibilityTime: 2000,
            });
        }else{
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM buildings WHERE is_buy = ?;',
                    [1],
                    (_, { rows }) => {
                        let isBuildingExist = false
                        const len = rows.length;
                        for (let i = 0; i < len; i++) {
                            let row = rows.item(i);
                            isBuildingExist = buildingId == row.id
                            if (isBuildingExist) break
                        }
                        if (isBuildingExist) {
                            Toast.show({
                                type: 'error',
                                text1: 'Already Building Exist.',
                                autoHide: true,
                                visibilityTime: 2000,
                            });
                        } else {
                            db.transaction(tx => {
                                tx.executeSql(
                                    'UPDATE buildings SET is_buy = ? WHERE id = ?;',
                                    [1, buildingId],
                                    (tx, results) => {
                                        recomputeBalance()
                                    },
                                    (error) => {
                                        console.log('Error updating data:', error);
                                    }
                                );
                            });
                            Toast.show({
                                type: 'success',
                                text1: 'Rent successfully',
                                autoHide: true,
                                visibilityTime: 2000,
                            });
                        }
                    },
                    (tx, error) => {
                        console.log('Error fetching building:', error);
                    }
                );
            })
        }
    }

    const rentNow = () => {
        buyNow()
        setModalVisible(false)
    }

    const goToback = () => {
        navigation.goBack()
    }

    const openRentNowModal = (item) => {
        setbuildingName(item.name)
        setbuildingPrice(item.price)
        setBuildingId(item.id)
        setModalVisible(true)
    }

    const renderBuildingTemp = (data) => {
        return (
            <TouchableOpacity style={{ marginTop: 30, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#49337d' }} key={data.id} onPress={() => openRentNowModal(data)}>
                <View style={{ width: "25%" }}>
                    <Image source={data.image} style={styles.buildingImg} />
                </View>
                <View style={{ width: "75%" }}>
                    <Text style={[styles.text, styles.h4]}>{data.name}</Text>
                    <Text style={[styles.text, styles.h4]}>₹{data.price.toLocaleString()}/Month</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <ImageBackground
            source={require('../assets/backgroundImage.jpg')}
            style={styles.mainContainer}
        >
            <View style={styles.container}>
                <View style={{ marginLeft: 10, marginRight: 10, marginTop: 10, flex: 1 }}>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity style={{ width: '33.3%' }} onPress={() => goToback()}>
                            <Text style={[styles.text, styles.button]}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ width: '33.3%' }}>
                            <Text style={[styles.text, styles.h3, { textAlign: 'center' }]}>Building</Text>
                        </TouchableOpacity>
                        <Text style={{ width: '33.3%' }}></Text>
                    </View>
                    <View style={{ marginTop: 20, flex: 1 }}>
                        <Text style={[styles.text, styles.h4, { textAlign: 'right' }]}> ₹{updatedBalance.toLocaleString()}</Text>
                        <SafeAreaView style={{ flex: 1, marginTop: 10 }}>
                            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                                <ReactNativeModal
                                    isVisible={modalVisible}
                                    onBackdropPress={() => setModalVisible(false)}
                                    onBackButtonPress={() => setModalVisible(false)}
                                    backdropTransitionOutTiming={1}
                                    style={{ justifyContent: 'flex-end', margin: 0 }}
                                >
                                    <View style={{ backgroundColor: '#2e306e', height: 230, borderTopStartRadius: 20, borderTopEndRadius: 20, position: 'relative' }}>
                                        <View style={{ margin: 10 }}>
                                            <View>
                                                <Text style={[styles.h2, { padding: 10, color: 'white' }]}>{buildingName}</Text>
                                                <Text style={[styles.h4, { padding: 10, color: 'white' }]}>₹{buildingPrice.toLocaleString()}/Month</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={{ position: 'absolute', bottom: 20, left: 0, right: 0 }} onPress={() => rentNow()}>
                                            <Text style={styles.rentNowButton}>Rent Now</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ReactNativeModal>
                                {
                                    buildingData.length ? (
                                        buildingData.map((data) => {
                                            return (
                                                <View key={data.id}>
                                                    {renderBuildingTemp(data)}
                                                    <View style={styles.separator} />
                                                </View>
                                            )
                                        })
                                    ) :
                                        (
                                            <Text style={styles.text}>No Building Found</Text>
                                        )
                                }
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                </View>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
    },
    text: {
        color: 'white',
    },
    h1: {
        fontSize: 40,
        fontWeight: 'bold',
    },
    h2: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    h3: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    h4: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    h5: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    button: {
        fontSize: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#823894',
        padding: 10,
        borderRadius: 100,
        width: 90,
    },
    buildingImg: {
        height: 80,
        width: 80,
        resizeMode: 'cover',
        borderTopRightRadius:10,
        borderBottomRightRadius:10


    },
    rentNowButton: {
        backgroundColor: '#823894',
        color: 'white',
        textAlign: 'center',
        marginLeft: 10,
        marginRight: 10,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 10,
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: 'grey',
    },
})

export default BuildingsPage