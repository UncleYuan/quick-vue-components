import isEqual from "lodash/isEqual";
import isArray from "lodash/isArray";
import cloneDeep from "lodash/cloneDeep";

import request from "../../utils/request";

export default function(component, childrenComponent, otherConf = {}) {
  return {
    props: Object.assign({
      fetchType: {
        type: String,
        default: "get"
      },
      url: {
        type: [String, Function],
        default: ""
      },
      reFetchKey: {
        type: String,
        default: ""
      },
      getFirstOpt: {
        type: Boolean,
        default: false
      },
      fetchData: {
        type: [Object, Function],
        default: () => ({})
      },
      mergeGetParams: {
        type: Object,
        default: () => ({})
      },
      afterSetFirsetOptionsVal: {
        type: Function,
        default: () => {}
      },
      isResultSuccess: {
        type: Function,
        default: d => !!d
      },
      resDataFilter: {
        type: Function,
        default: res => res
      },

      value: {
        type: [String, Number, Array],
        default: ""
      },
      options: {
        type: Array,
        default: () => []
      },
     
    },
    (component?component.props : {})
    ),
    name: "GetOptionsHoc",
    model: {
      prop: "value", // 要存在于props
      event: "changeValue" // 当组件的值发生改变时要emit的事件名
    },
    watch: {
      mergeGetParams: function(newV, oldV) {
        if (this.reFetchKey && isEqual(newV[this.reFetchKey], oldV[this.reFetchKey])) {
          this.urlToGetOptions(this.url, this.fetchType, this.fetchData);
        }
      },
      url: function(newV, oldV) {
        if (!isEqual(newV, oldV)) {
          this.urlToGetOptions(newV, this.fetchType, this.fetchData);
        }
      },
      fetchData: function(newVal, oldVal) {
        if (!isEqual(newVal, oldVal)) {
          this.urlToGetOptions(this.url, this.fetchType, newVal);
        }
      },
      setValue: function(newVal, oldVal) {
        this.$emit("changeValue", newVal);
      },
      options: function(newVal, oldVal) {
        this.setOptions = newVal;
      },
      value: function(newVal) {
        this.setValue = newVal;
      }
    },
    data() {
      return {
        setOptions: this.options || [],
        loadDataing: false,
        setValue: this.value
      };
    },
    created() {
      this.urlToGetOptions(this.url, this.fetchType, this.fetchData);
    },
    methods: {
      urlToGetOptions(url, fetchType = "get", fetchData = {}) {
        if (!url) return;

        let setFetchData =
          typeof fetchData == "function" ? fetchData(this, cloneDeep(this.mergeGetParams.__ob__.value)) : fetchData;

        url = typeof url == "function" ? url(setFetchData, this) : url;

        if (fetchType == "get") {
          setFetchData = {
            params: setFetchData
          };
        }

        this.loadDataing = true;
        request({
          url: url,
          method: fetchType,
          [fetchType == "get" ? "params" : "data"]: setFetchData
        }).then(res => {
          const resData = this.resDataFilter(res);

          this.loadDataing = false;

          if (this.isResultSuccess(resData)) {
            const setData = resData && typeof resData.data != "undefined"
              ? resData.data
              : resData;
            this.setOptions = setData;
            if (this.getFirstOpt && (!this.value || !this.value.length)) {
              this.setValue = setData[0].value;
              this.$nextTick(() => {
                this.afterSetFirsetOptionsVal(this.setValue);
              });
            }
          }
        })
          .catch(err => {
            console.log(err);
          });
      },
      optionsRender() {
        const h = this.$createElement;
        if (!childrenComponent) return [];
        return this.setOptions.map((item, idx) => {
          const setAttr =Object.assign(
            {},
            {
              key: item.value,
              label: item.label,
              disabled: item.disabled,
              value: item.value
            }
          );

          return h(
            childrenComponent,
            {
              attrs: otherConf.setAttrFunc ? otherConf.setAttrFunc(setAttr) : setAttr
            },
            item.label
          );
        }
        );
      }
    },
    render(h) {
      const { setOptions } = this;
      const slots = Object.keys(this.$slots)
        .reduce((arr, key) => arr.concat(this.$slots[key]), [])
        .map(vnode => {
          vnode.context = this._self;
          return vnode;
        });
      const setProps = Object.assign({},this.$props);
      if (component.props.options) {
        setProps.options = setOptions;
      }

      return h(
        component,
        {
          model: {
            value: this.setValue,
            callback: $$v => {
              this.setValue = $$v;
            },
            expression: "setValue"
          },
          on: this.$listeners,
          props: setProps,
          scopedSlots: this.$scopedSlots,
          attrs:Object.assign({},this.$attrs,{ options: setOptions })
        },
        !slots || (isArray(slots) && !slots.length)
          ? this.optionsRender()
          : slots
      );
    }
  };
}
