
export default {
  name: "SlotRender",

  props: {
    slotRender: {
      type: Object,
      default: () => <div />
    }

  },

  render(h) {
    const { slotRender } = this;

    return slotRender();
  }
};
