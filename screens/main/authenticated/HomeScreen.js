/**
 * @file Manages home screen (main screen once user is signed in).
 * @author Emily Sturman <emily@sturman.org>
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedTouchable from "../../../components/AnimatedTouchable";
import Card from "../../../components/orders/Card";
import Header from "../../../components/Header";
import Layout from "../../../constants/Layout";
import Colors from "../../../constants/Colors";
import { READABLE_FORMAT } from "../../../constants/Date";
import { deleteOrder, focusOrder, unfocusOrder, logOut, watchOrders } from "../../../redux/Actions";
import { connect } from "react-redux";
import moment from "moment";
import Alert from "../../../constants/Alert";
import reportToSentry from "../../../constants/Sentry";

const STORAGE_KEY = "@order_options";

/**
 * Stores current order presets (to reference when app is next opened).
 *
 * @param {Object[]} orderOptions Current order options (from Firebase).
 * @return {Promise<void>} Promise for function.
 */
const storeData = async (orderOptions) => {
  try {
    const stringifiedOptions = JSON.stringify(orderOptions);
    await AsyncStorage.setItem(STORAGE_KEY, stringifiedOptions);
  } catch (e) {
    reportToSentry(e);
  }
};

/**
 * Fetches order options from previous session.
 * @return {Promise<Object[]>} Previous order options.
 */
const getData = async () => {
  try {
    const stringifiedOptions = await AsyncStorage.getItem(STORAGE_KEY);
    return stringifiedOptions ? JSON.parse(stringifiedOptions) : null;
  } catch(e) {
    reportToSentry(e);
  }
}

/**
 * Renders app home screen.
 *
 * @param {Object[]}                 [orders=[]]       Array of user's upcoming orders sorted in chronological order (soonest to farthest).
 * @param {Object}                   [orderPresets={}] Object containing user's order presets.
 * @param {Object[]}                 orderOptions      Array of order options.
 * @param {string}                   uid               Unique user ID (generated by Firebase Auth).
 * @param {string}                   domain            Domain key for user's domain.
 * @param {function()}               logOut            Function to log user out.
 * @param {function(string)}         focusOrder        Function to focus a specific order in state.
 * @param {function()}               unfocusOrder      Function to unfocus all orders in state.
 * @param {function(string, string)} deleteOrder       Function to delete an order.
 * @param {function(string)}         watchOrders       Function to create listener in user's orders collection.
 * @param {Object}                   navigation        Navigation object (passed by React Navigation).
 *
 * @return {React.ReactElement} Element to render.
 * @constructor
 */
const HomeScreen = ({ orders = [], orderPresets = {}, orderOptions, uid, logOut, focusOrder, unfocusOrder, deleteOrder, watchOrders, domain, navigation }) => {
  const [loadedData, setLoadedData] = useState(false);
  const editUser = () => navigation.navigate("Settings");

  // Opens the order screen for a new order.
  const newOrder = () => {
    if (Object.keys(orderPresets).length === 0) {
      navigation.navigate("Order", { screen: "Custom Order"});
    } else {
      navigation.navigate("Order")
    }
  };

  // Opens the order screen to edit an order.
  const focusOrderNavigate = (id, hasTitle) => {
    focusOrder(id);
    if (hasTitle) {
      navigation.navigate("Order", { screen: "Preset Order" });
    } else {
      navigation.navigate("Order", { screen: "Custom Order" });
    }
  };

  // Creates listeners for user's orders collection, popping screen (for log out), and focusing screen (for unfocusing an order).
  useEffect(() => {
    const unsubscribeFromWatchOrders = watchOrders(uid, domain);
    const unsubscribeFromListener = navigation.addListener("beforeRemove", (e) => {
      if (e.data.action.type === "POP") {
        unsubscribeFromWatchOrders();
        logOut();
      }
    });
    return () => {
      unsubscribeFromWatchOrders();
      unsubscribeFromListener();
    }
  }, [navigation]);

  // Unfocuses orders when page loads
  useEffect(() => navigation.addListener("focus", () => unfocusOrder()), [navigation]);

  // Handles storing/comparing data from current & previous sessions
  useEffect(() => {
    // If page has just loaded, compare current data with last session's data
    if (!loadedData) {
      getData().then((prevOptions) => {
        setLoadedData(true);
        if (prevOptions) {
          const prevOptionsStr = JSON.stringify(prevOptions);
          const currentOptionsStr = JSON.stringify(orderOptions);
          if (prevOptionsStr !== currentOptionsStr) {
            Alert(
              "Order Fields Changed",
              "Order fields have changed since your last session. Please edit your orders, or they may be invalid."
            );
          }
        }
      });
    }
    // Store order options for future sessions
    storeData(orderOptions);
  }, [orderPresets]);

  return (
    <View style={styles.container}>
      <Header
        title={"Home"}
        style={styles.header}
        leftButton={{ name: "md-log-out", style: styles.logOutIcon, onPress: () => navigation.pop() }}
        rightButton={{ name: "md-settings", onPress: editUser }}
      >
        <AnimatedTouchable style={styles.placeOrderButton} endOpacity={1} onPress={newOrder}>
          <Text style={styles.placeOrderButtonText}>Place an order</Text>
        </AnimatedTouchable>
      </Header>
      <FlatList
        ListEmptyComponent={() => <Text style={styles.emptyText}>No orders to display</Text>}
        data={orders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) =>
          <Card
            title={item.title}
            date={item.date}
            onPress={() => focusOrderNavigate(item.key, !!item.title)}
            onDelete={() => deleteOrder(item.key, domain)}
            {...item}
          />
        }
        contentContainerStyle={[styles.contentContainer, { paddingBottom: useSafeAreaInsets().bottom }]}
        style={styles.flatList}
      />
    </View>
  )
};

/**
 * Gets array of user's future orders sorted chronologically.
 *
 * Converts order object to array, then filters out past orders and
 * sorts by date (soonest to farthest).
 *
 * @param {Object} orders Object containing all of user's orders.
 * @param {moment.Moment} cutoffTime Time after which new orders may not be placed for today.
 *
 * @return {Object[]} Array of order objects to be displayed on Home Screen.
 */
const getOrdersArr = (orders, cutoffTime) => (
  Object.values(orders)
    .filter(({ date }) => {
      // date will be at midnight; if it's not yet cutoff time, we want to include today's order, so set now to today at midnight
      let now = moment();
      if (now.isBefore(cutoffTime)) {
        now.startOf("day");
      }
      return date.isSameOrAfter(now);
    })
    .sort((orderA, orderB) => orderA.date.diff(orderB.date))
    .map((order) => ({ ...order, date: order.date.format(READABLE_FORMAT) }))
);

const mapStateToProps = ({ orders, orderPresets, stateConstants, user, domain }) => ({
  orders: getOrdersArr(orders, stateConstants.cutoffTime),
  orderPresets,
  orderOptions: stateConstants.orderOptions,
  uid: user?.uid,
  domain: domain.id
});

const mapDispatchToProps = (dispatch) => ({
  logOut: () => logOut(dispatch),
  focusOrder: (id) => dispatch(focusOrder(id)),
  unfocusOrder: () => dispatch(unfocusOrder()),
  deleteOrder: (id, domain) => deleteOrder(dispatch, id, domain),
  watchOrders: (uid, domain) => watchOrders(dispatch, uid, domain)
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundColor,
    flex: 1
  },
  header: {
    paddingBottom: 15 + Layout.placeOrderButton.height / 2
  },
  placeOrderButton: {
    backgroundColor: Colors.accentColor,
    borderRadius: 100,
    width: Layout.window.width - Layout.placeOrderButton.horizontalPadding,
    height: Layout.placeOrderButton.height,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: -Layout.placeOrderButton.height / 2,
    left: Layout.placeOrderButton.horizontalPadding / 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 2
  },
  placeOrderButtonText: {
    color: Colors.textOnBackground,
    fontFamily: "josefin-sans-bold",
    fontSize: Layout.fonts.title,
    textAlign: "center"
  },
  logOutIcon: {
    transform: [{ rotate: "180deg" }]
  },
  flatList: {
    backgroundColor: Colors.scrollViewBackground
  },
  contentContainer: {
    padding: 10,
    paddingTop: Layout.placeOrderButton.height / 2 + 10
  },
  emptyText: {
    color: Colors.primaryText,
    fontSize: Layout.fonts.body,
    textAlign: "center",
    fontFamily: "josefin-sans",
    marginTop: 20
  }
});