import merge from "lodash/merge";
import request from "../../utils/request";
import "./index.scss";

function mousewheel(obj, downfn, upfn) {
  obj.onmousewheel = fn;
  if (obj.addEventListener) {
    obj.addEventListener("DOMMouseScroll", fn, false);
  }
  function fn(ev) {
    ev = ev || window.event;
    let b = true;
    if (ev.wheelDelta) {
      b = ev.wheelDelta > 0;
    } else {
      b = ev.detail < 0;
    }
    if (b) {
      upfn && upfn();
    } else {
      downfn && downfn();
    }
    if (ev.preventDefault) {
      ev.preventDefault();
    }
    return false;
  }
}

function unmousewheel(obj, fn) {
  if (obj.onmousewheel) obj.onmousewheel = null;
  if (obj.addEventListener) {
    obj.removeEventListener("DOMMouseScroll", fn);
  }
}

export default {
  name: "Editor",

  props: {
    fileUploadConf: {
      type: Object,
      default: () => ({})
    },
    fileUploadUrl: {
      type: [String, Function],
      default: "/test"
    },
    uploadMergeData: {
      type: Object,
      default: () => ({})
    },
    defaultConf: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: String,
      default: ""
    },
    name: {
      type: String,
      default: "editor"
    },
    megreConfig: {
      type: Object,
      default: () => {}
    },
    setConfigFunc: {
      type: Function,
      default: res => res
    },
    afterInputChange: {
      type: Function,
      default: res => res
    },
    addButtons: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    inputDisabled: {
      type: Boolean,
      default: false
    },
    setupCallBack: {
      type: Function,
      default: res => res
    },
    afterChange: {
      type: Function,
      default: res => res
    }
  },
  components: {},
  /**
   * 设置formvalue
   */
  model: {
    prop: "value", // 要存在于props
    event: "changeValue" // 当组件的值发生改变时要emit的事件名
  },
  // 监听formValue变化传递变化
  watch: {
    editorValue: function(newVal, oldVal) {
      this.$emit("changeValue", newVal);
    },
    value: function(newVal, oldVal) {
      if (newVal != oldVal && newVal != this.editorValue) {
        this.editorValue = newVal;
        if (this.currentEditor) this.currentEditor.setContent(newVal);
      }
    },
    disabled: function(newVal, oldVal) {
      if (oldVal && !newVal) {
        this.init();
      }
    }
  },
  data() {
    return {
      editorValue: this.value || ""
    };
  },
  mounted() {
    setTimeout(() => {
      this.init();
    }, 500);
  },
  beforeDestroy() {
    window.$(".tox-silver-sink").remove();
    window.$("[data-edit-input]").remove();
  },
  methods: {
    init() {
      const _this = this;
      const setProps = this;
      const {
        megreConfig,
        setConfigFunc,
        name,
        disabled,
        addButtons,
        setupCallBack,
        afterChange
      } = setProps;

      console.debug("Mount editor " + name);
      const inputButtonsToolbar = addButtons
        ? addButtons.map(x => x.name).join(" ")
        : "";
      let toolbar =
        "code  undo redo | fontselect styleselect fontsizeselect | bold italic underline forecolor backcolor | bullist numlist outdent indent alignleft aligncenter alignright | hr link unlink image media table |  preview fullscreen ";
      if (inputButtonsToolbar !== "") {
        toolbar = `${toolbar} | ${inputButtonsToolbar}`;
      }

      // 'Andale Mono=andale mono,monospace;' +
      // 'Book Antiqua=book antiqua,palatino,serif;' +
      // 'Comic Sans MS=comic sans ms,sans-serif;' +
      // 'Courier New=courier new,courier,monospace;' +
      // 'Georgia=georgia,palatino,serif;' +
      // 'Helvetica=helvetica,arial,sans-serif;' +
      // 'Impact=impact,sans-serif;' +
      // 'Symbol=symbol;' +
      // 'Tahoma=tahoma,arial,helvetica,sans-serif;' +
      // 'Terminal=terminal,monaco,monospace;' +
      // 'Trebuchet MS=trebuchet ms,geneva,sans-serif;' +
      // 'Verdana=verdana,geneva,sans-serif;' +
      // 'Webdings=webdings;' +
      // 'Wingdings=wingdings,zapf dingbats'
      const config = {
        language: "zh_CN",

        selector: `textarea[name=${this.name}]`,
        // theme: "modern",
        readonly: disabled ? 1 : undefined,
        plugins: [
          "code advlist autolink lists link image charmap print preview hr anchor pagebreak",
          "searchreplace visualblocks visualchars code fullscreen",
          "insertdatetime media nonbreaking save table contextmenu directionality",
          "template paste textcolor colorpicker textpattern imagetools",
          "autoresize"
        ],
        font_formats:
          "宋体=宋体;仿宋GB2312=仿宋GB2312;微软雅黑=微软雅黑;华文黑体=华文黑体;楷体GB2312=楷体GB2312;方正小标宋简体=方正小标宋简体" +
          "Arial=arial,helvetica,sans-serif;" +
          "Arial Black=arial black,sans-serif;" +
          "Times New Roman=times new roman,times,serif;",
        fontsize_formats:
          "5pt 5.5pt 6.5pt 7.5pt 9pt 10.5pt 12pt 14pt 16pt 18pt 22pt 24pt 26pt 36pt 42pt",
        toolbar: toolbar,
        menubar: "",
        setup: editor => {
          // 判断添加按钮
          if (addButtons && addButtons.length) {
            addButtons.map((btn, idx) => {
              editor.ui.registry.addButton(btn.name, {
                text: btn.text,
                icon: btn.icon,
                onAction: function(_) {
                  btn.onClick(editor);
                  // editor.insertContent('&nbsp;<strong>It\'s my button!</strong>&nbsp;');
                }
              });
            });
          }

          if (setupCallBack) {
            setupCallBack(editor);
          }
        },
        relative_urls: false,
        init_instance_callback: editor => {
          if (this.disabled) {
            window.$("body").addClass("editor-disabled");
          } else {
            window.$("body").removeClass("editor-disabled");
          }
          this.currentEditor = editor;

          editor.on("change", e => {
            console.debug("Editor value changed to: ", e.target.getContent());
            this.$refs.editor.value = e.target.getContent() || "";
            this.editorValue = this.$refs.editor.value;
            if (afterChange) {
              afterChange(e, {
                name: name,
                value: e.target.getContent() || ""
              });
            }
          });

          if (_this.inputDisabled) {
            window.$("#editor_ifr")
              .contents()
              .find("input")
              .attr("readonly", "true");
          }
          editor.on("click", function(e) {
            console.debug("Element clicked:", e, e.target.nodeName);

            if (e.target.type == "text" && !_this.inputDisabled) {
              _this.settingInput(e);
            }
            if (window.$(e.target).attr("data-select-wrap")) {
              const selectObj = window.$(e.target)
                .parent()
                .find("select[data-edit]");

              const opts = [];
              const orgOpts = [];
              selectObj.find("option").each((idx, item) => {
                orgOpts.push({ text: window.$(item).text(), value: window.$(item).val() });
                opts.push(window.$(item).text());
              });

              editor.windowManager.open({
                title: "编辑选择框",
                body: [
                  {
                    type: "textbox",
                    name: "name",
                    value: selectObj[0].name,
                    hidden: true
                  },
                  {
                    type: "textbox",
                    name: "title",
                    label: "名称",
                    value: selectObj[0].title,
                    readonly: true
                  },
                  {
                    type: "selectbox",
                    name: "value",
                    options: opts,
                    label: "意向值"
                  }
                ],
                onsubmit: function(e) {
                  const v = window.$(`#${e.target._id}`)
                    .find("select option:selected")
                    .val();
                  let str = "";
                  orgOpts.map((opt, idx) => {
                    str += `<option value="${opt.value}" ${
                      v == opt.text ? 'selected="true"' : ""
                    }>${opt.text}</option>`;
                  });

                  selectObj.html(str);
                }
              });
            }
          });
        },
        media_live_embeds: true,
        media_alt_source: false,
        media_poster: false,
        video_template_callback: data => {
          console.debug("[Editor]Video template callback", arguments);
          return (
            '<video class="video-js vjs-default-skin" preload="auto" width="' +
            data.width +
            '" height="' +
            data.height +
            '"' +
            (data.poster ? ' poster="' + data.poster + '"' : "") +
            ' controls="controls">\n' +
            '<source src="' +
            data.source1 +
            '"' +
            (data.source1mime ? ' type="' + data.source1mime + '"' : "") +
            " />\n" +
            (data.source2
              ? '<source src="' +
                data.source2 +
                '"' +
                (data.source2mime ? ' type="' + data.source2mime + '"' : "") +
                " />\n"
              : "") +
            "</video>"
          );
        },
        file_browser_callback: function(field_name, url, type, win) {
          console.debug("[Editor]File browser callback", arguments);
          const target = win.document.getElementById(field_name);
          const callback = data => {
            console.debug("[Editor]Handle response", data.response, target);
            if (data.response.status == 0) target.value = data.response.data.url;
          };
          if (type == "image") _this.handleBrowse(callback);
        },
        file_picker_callback: function(callback, value, meta) {
          console.debug("[Editor]File picker callback", arguments);

          // Provide image and alt text for the image dialog
          if (meta.filetype == "image") {
            _this.handleBrowse(response => {
              if (response.status == 0) { callback(response.data.url, { alt: response.data.name }); }
            });
          }

          // Provide alternative source and posted for the media dialog
          if (meta.filetype == "media") {
            _this.handleBrowse(response => {
              if (response.status == 0) callback(response.data.url);
            });
          }
        },
        ...this.defaultConf
      };

      window.tinymce.init(setConfigFunc(merge(config, megreConfig)));
    },
    settingInput(e) {
      const _this = this;
      const { target } = e;
      if (window.$(target).attr("disabled") || window.$(target).attr("readonly")) return;
      const inputDom = window.$(`<input data-edit-input="true" name="${""}" />`);
      const ifrDom = window.$(`#${_this.name}_ifr`);
      inputDom.css({
        width: window.$(target).outerWidth(),
        height: window.$(target).outerHeight(),
        position: "absolute",
        left:
          ifrDom.offset().left +
          window.$(target).offset().left -
          ifrDom.contents().scrollLeft(),
        top: ifrDom.offset().top + window.$(target).offset().top
      });
      inputDom.val(target.value);
      window.$("body").append(inputDom);
      const setFn = () => {
        inputDom.css({
          left:
            ifrDom.offset().left +
            window.$(target).offset().left -
            ifrDom.contents().scrollLeft(),
          top: ifrDom.offset().top + window.$(target).offset().top
        });
      };
      mousewheel(ifrDom.contents()[0], setFn, setFn);
      mousewheel(document, setFn, setFn);
      inputDom.focus();
      inputDom.blur(function() {
        unmousewheel(ifrDom.contents()[0], setFn);
        unmousewheel(document, setFn);
        const setVal = window.$(this).val();

        inputDom.remove();
        window.$(target).attr({ value: setVal });
        window.$(target).val(setVal);

        if (_this.afterInputChange) _this.afterInputChange(target);
      });
    },
    handleBrowse(cb) {
      const container = document.getElementById(`editor_${this.name}`);

      // Create file input
      const file = document.createElement("input");
      file.setAttribute("type", "file");
      file.setAttribute("style", "display: none;");

      const handleUpload = event => {
        //

        /*      const reader = new FileReader();
        reader.readAsDataURL(file.files[0]);
        reader.addEventListener("load", () => {
          cb({
            status: 0,
            data: {
              name: file.files[0].name,
              url: reader.result
            }
          });
        });

        return; */
        if (FormData) this._ajaxUpload(file, cb);
        else this._iframeUpload(file, cb);
      };

      // Attach file change event
      if (file.attachEvent) file.attachEvent("onchange", handleUpload);
      else file.addEventListener("change", handleUpload, false);
      container.appendChild(file);

      file.click();
    },
    _ajaxUpload(file, cb) {
      const formData = new FormData();
      const fileUploadUrl =
        typeof this.fileUploadUrl == "function"
          ? this.fileUploadUrl(this)
          : this.fileUploadUrl;

      if (this.uploadMergeData) {
        Object.keys(this.uploadMergeData).map(k => {
          formData.append(k, this.uploadMergeData[k]);
        });
      }
      formData.append("file", file.files[0]);
      // $.ajax({
      //     url: '/nuts/file/upload',
      //     type: 'POST',
      //     data: formData,
      //     mimeType: 'multipart/form-data',
      //     contentType: false,
      //     cache: false,
      //     processData: false,
      //     success: (data, textStatus, jqXHR) => {
      //         cb(JSON.parse(data))
      //         // this.handleUploadResponse(JSON.parse(data), target)
      //         this.refs.container.removeChild(file)
      //     },
      //     error: (jqXHR, textStatus, errorThrown) => {
      //         console.error("Failed to upload image")
      //         this.refs.container.removeChild(file)
      //     }
      // });
      request({

        url: fileUploadUrl,
        method: "post",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data"
        },
        ...this.fileUploadConf
      }).then(data => {
        console.log(data);
        // cb(data);
        // this.$refs.container.removeChild(file);
      })
        .catch(err => {
          console.log(err);
          // this.$refs.container.removeChild(file);
          // console.error("Failed to upload image");
        });
    },

    _iframeUpload(file, cb) {
      const { container } = this.$refs;
      const iframeName = "unique_upload_" + Math.random();
      const fileUploadUrl =
        typeof this.fileUploadUrl == "function"
          ? this.fileUploadUrl(this)
          : this.fileUploadUrl;
      // Create form
      const form = document.createElement("form");
      form.setAttribute("target", iframeName);
      form.setAttribute("action", fileUploadUrl);
      form.setAttribute("method", "post");
      form.setAttribute("enctype", "multipart/form-data");
      form.setAttribute("encoding", "multipart/form-data");
      if (this.uploadMergeData) {
        Object.keys(this.uploadMergeData).map(k => {
          const input = document.createElement("input");
          input.setAttribute("type", "hidden");
          input.setAttribute("name", k);
          input.setAttribute("value", this.uploadMergeData[k]);
          form.appendChild(input);
        });
      }
      form.appendChild(file);
      container.appendChild(form);

      // Create iframe
      const iframe = document.createElement("iframe");
      iframe.setAttribute("name", iframeName);
      iframe.setAttribute("style", "display: none;");
      const loadHandler = e => {
        // Remove event.
        if (iframe.detachEvent) iframe.detachEvent("onload", loadHandler);
        else iframe.removeEventListener("load", loadHandler, false);

        let response = "";
        // Get response.
        if (iframe.contentDocument) {
          response = iframe.contentDocument.body.innerHTML;
        } else if (iframe.contentWindow) {
          response = iframe.contentWindow.document.body.innerHTML;
        } else if (iframe.document) {
          response = iframe.document.body.innerHTML;
        }

        cb(JSON.parse(response));
        // this.handleUploadResponse(response, target)

        // Delete the iframe and form.
        container.removeChild(form);
        container.removeChild(iframe);
      };
      if (iframe.addEventListener) iframe.addEventListener("load", loadHandler);
      else if (iframe.attachEvent) iframe.attachEvent("onload", loadHandler);
      container.appendChild(iframe);

      form.submit();
    }
  },

  render(h) {
    const { editorValue, disabled, name } = this;

    return (
      <div
        class={`comp-editor-wrap ${disabled ? "disabled" : ""}`}
        ref="container"
        id={`editor_${name}`}
      >
        <textarea
          name={name}
          ref="editor"
          domPropsInnerHTML={editorValue}
        ></textarea>
      </div>
    );
  }
};
