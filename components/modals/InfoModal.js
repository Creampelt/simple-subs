/**
 * @file Creates top-level info modal.
 * @author Emily Sturman <emily@sturman.org>
 */
import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Animated,
  Text,
  TouchableHighlight,
} from "react-native";
import Layout from "../../constants/Layout";
import Colors from "../../constants/Colors";
import { setInfoMessage } from "../../redux/Actions";
import { connect } from "react-redux";

// Constants for horizontal/vertical margin
const MARGIN_HORIZONTAL = 10;
const MARGIN_VERTICAL = 40;
// Time in seconds until modal automatically closes
const CLOSE_MODAL_TIMEOUT = 10;
// String that represents a closed modal
export const CLOSED_INFO_MODAL = "    ";

const TouchableAnimated = Animated.createAnimatedComponent(TouchableHighlight);

/**
 * Computes translate animation style for modal.
 *
 * Interpolates scale animated value (from 0 to 1) to correct values for modal
 * to slide from bottom position to offscreen.
 *
 * @param {Animated.Value} animated     Animated value for translate/slide animation.
 *
 * @returns {Object} Style object to be applied to the modal.
 */
const getModalStyle = (animated) => {
  const scaleInterpolation = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1]
  });
  return { transform: [{ scale: scaleInterpolation }], opacity: animated };
};

/**
 * Triggers toggle animation for opening/closing modal.
 *
 * Starts timing animation for translate; closes modal
 * if modal is open, opens modal if modal is closed.
 *
 * @param {boolean}        open           Whether modal is currently being opened.
 * @param {Animated.Value} animated       Animated value for translate animation.
 * @param {function()}     displayMessage Function that displays the new message on the modal (ensures that message doesn't disappear until after animation).
 */
const toggleAnimation = (open, animated, displayMessage) => {
  animated.setValue(open ? 0 : 1);
  if (open) displayMessage();
  Animated.timing(animated, {
    duration: 100,
    toValue: open ? 1 : 0,
    useNativeDriver: true
  }).start(() => {
    if (!open) displayMessage();
  });
};

/**
 * Renders a modal that displays important info messages at
 * various places in the app.
 *
 * Uses Animated API to animate slide animation; modal also closes when tapped
 * or when it times out.
 *
 * @param {string}   infoMessage Message to be displayed in modal; CLOSED_INFO_MODAL message will hide the modal.
 * @param {Function} closeModal  Function to close the modal.
 *
 * @returns {React.ReactElement} Component representing modal.
 * @constructor
 */
const InfoModal = ({ infoMessage, closeModal }) => {
  const [displayedMessage, displayMessage] = useState(infoMessage);
  const animated = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef();

  // Closes info modal after 10 seconds if new message does not appear
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    toggleAnimation(infoMessage !== CLOSED_INFO_MODAL, animated, () => displayMessage(infoMessage));
    timeoutRef.current = setTimeout(closeModal, CLOSE_MODAL_TIMEOUT * 1000);
  }, [infoMessage]);

  // render nothing if closed (so you can click through the hidden modal)
  if (displayedMessage === CLOSED_INFO_MODAL && infoMessage === CLOSED_INFO_MODAL) {
    return null;
  } else {
    return (
      <TouchableAnimated
        onPress={closeModal}
        style={[styles.container, getModalStyle(animated)]}
        underlayColor={Colors.infoModal}
        delayPressIn={0}
        activeOpacity={0.5}
      >
        <Text style={styles.text}>{displayedMessage}</Text>
      </TouchableAnimated>
    );
  }
};

const mapStateToProps = ({ infoMessage }) => ({
  infoMessage
});

const mapDispatchToProps = (dispatch) => ({
  closeModal: () => dispatch(setInfoMessage(CLOSED_INFO_MODAL))
})

export default connect(mapStateToProps, mapDispatchToProps)(InfoModal);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 1000000,
    width: Layout.window.width - MARGIN_HORIZONTAL * 2,
    left: MARGIN_HORIZONTAL,
    bottom: MARGIN_VERTICAL,
    backgroundColor: Colors.infoModal,
    padding: 15,
    paddingTop: 17,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: "#000",
    shadowRadius: 3,
    shadowOpacity: 0.5
  },
  text: {
    fontFamily: "josefin-sans",
    color: Colors.textOnBackground,
    fontSize: Layout.fonts.body
  }
});