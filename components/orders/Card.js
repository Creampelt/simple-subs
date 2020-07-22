import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Ionicons } from "@expo/vector-icons";
import AnimatedTouchable from "../AnimatedTouchable";

import Layout from "../../constants/Layout";
import Colors from "../../constants/Colors";

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);
const isString = (str) => typeof str === "string";

const getIngredientStr = (ingredients) => {
  let allIngredients = []
  for (let category in ingredients) {
    if (ingredients.hasOwnProperty(category)) {
      let ingredient = ingredients[category];
      if (ingredient.length > 0) {
        if (isString(ingredient)) {
          allIngredients.push(ingredient);
        } else {
          allIngredients.push(ingredient.join(", "));
        }
      }
    }
  }
  let ingredientStr = allIngredients.join(", ");
  return ingredientStr.charAt(0).toUpperCase() + ingredientStr.slice(1).toLowerCase();
}

const SwipeAction = ({ progress, icon, alignRight }) => {
  const scaleInterpolation = progress.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0.5, 1, 1]
  })
  return (
    <View style={[styles.swipeAction, alignRight && styles.swipeActionRight]}>
      <AnimatedIonicons
        name={`md-${icon}`}
        size={Layout.fonts.icon}
        color={Colors.primaryText}
        style={{ transform: [{ scale: scaleInterpolation }]}}
      />
    </View>
  );
}

const Card = ({ title, date, onPress, onDelete, ...ingredients }) => {
  const swipeableRef = useRef();

  const focusAndClose = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
    onPress();
  }

  return (
    <Swipeable
      ref={(ref) => swipeableRef.current = ref}
      leftThreshold={50}
      rightThreshold={50}
      renderLeftActions={(progress) => <SwipeAction progress={progress} icon={"create"}/>}
      renderRightActions={(progress) => <SwipeAction progress={progress} icon={"trash"} alignRight />}
      onSwipeableLeftOpen={focusAndClose}
      onSwipeableRightOpen={onDelete}
    >
      <AnimatedTouchable onPress={onPress}>
        <View style={styles.cardContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.date}>{date}</Text>
          <Text style={styles.ingredients} numberOfLines={title ? 1 : 2}>{getIngredientStr(ingredients)}</Text>
        </View>
      </AnimatedTouchable>
    </Swipeable>
  );
}

export default Card;

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 5,
    backgroundColor: Colors.backgroundColor,
    padding: 15,
    margin: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  title: {
    fontFamily: "josefin-sans-bold",
    fontSize: Layout.fonts.title,
    marginBottom: 5,
    color: Colors.primaryText
  },
  date: {
    fontFamily: "josefin-sans-bold",
    fontSize: Layout.fonts.body,
    color: Colors.primaryText,
    marginBottom: 5
  },
  ingredients: {
    fontFamily: "josefin-sans",
    fontSize: Layout.fonts.body,
    color: Colors.primaryText
  },
  swipeAction: {
    backgroundColor: "transparent",
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  swipeActionRight: {
    alignItems: "flex-end"
  }
});