<template>
  <div class="form">
    <div id="iframeEditor"></div>
  </div>
</template>

<script>
  // 需要在全局index里引入app.js
  export default {
    props: {
      url: {type: String}
    },
    data() {
      return {
        ExtsDocument: ['.doc', '.docx', '.docm',
          '.dot', '.dotx', '.dotm',
          '.odt', '.fodt', '.rtf', '.txt',
          '.html', '.htm', '.mht',
          '.pdf', '.djvu', '.fb2', '.epub', '.xps'],
        ExtsSpreadsheet: ['.xls', '.xlsx', '.xlsm',
          '.xlt', '.xltx', '.xltm',
          '.ods', '.fods', '.csv'],
        ExtsPresentation: ['.pps', '.ppsx', '.ppsm',
          '.ppt', '.pptx', '.pptm',
          '.pot', '.potx', '.potm',
          '.odp', '.fodp']
      }
    },
    computed: {
      fileName() {
        return this.url.substring(this.url.lastIndexOf('/') + 1, this.url.length)
      },
      fileType() {
        return this.url.substring(this.url.lastIndexOf('.') + 1, this.url.length)
      },
      documentType() {
        return this.getDocumentType(this.url.substring(this.url.lastIndexOf('.'), this.url.length))
      },
      key() {
        return this.getGuid()
      }
    },
    methods: {
      getDocumentType(extension) {
        if (this.ExtsDocument.indexOf(extension) >= 0) {
          return 'text'
        }
        if (this.ExtsSpreadsheet.indexOf(extension) >= 0) {
          return 'spreadsheet'
        }
        if (this.ExtsPresentation.indexOf(extension) >= 0) {
          return 'presentation'
        }
        return 'text'
      },
      getGuid() {
        function S4() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
        }
        return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4()
      },
      innerAlert(message) {
        console.log(message)
      },
      onAppReady() {
        this.innerAlert('打开文档！')
      },
      onDocumentStateChange(event) {
        const title = document.title.replace(/\*$/g, '')
        document.title = title + (event.data ? '*' : '')
      },
      onRequestEditRights() {
        location.href = location.href.replace(RegExp('action=view\\&?', 'i'), '')
      },
      onError(event) {
        if (event) {
          this.innerAlert(event.data)
        }
      },
      onOutdatedVersion() {
        location.reload(true)
      },
      connectEditor() {
        /*eslint-disable */
        const docEditor = new DocsAPI.DocEditor('iframeEditor', {
          width: '100%',
          height: '100%',
          type: 'desktop',
          documentType: this.documentType,
          document: {
            title: this.fileName,
            url: this.url,
            fileType: this.fileType,
            key: this.key,
            permissions: {
              edit: false,
              download: false,
              print: false
            }
          },
          editorConfig: {
            mode: 'view',
            lang: 'zh-CN',
            customization: {
              comments: false,
              chat: false,
              help: false,
              compactHeader: false,
              compactToolbar: false
            }
          },
          events: {
            onReady: this.onAppReady,
            onAppReady: this.onAppReady,
            onDocumentStateChange: this.onDocumentStateChange,
            onRequestEditRights: this.onRequestEditRights,
            onError: this.onError,
            onOutdatedVersion: this.onOutdatedVersion
          }
        })
        /*eslint-disable */
        console.log(docEditor, this.key, 8888)
      }
    },
    mounted() {
      window.addEventListener('load', this.connectEditor(), true)
    },
    beforeDestroy() {
      //  这块如果消除注释，打开文档会有问题，会显示上次鼠标点击的文档
      // console.log('remove')
       window.removeEventListener('load', this.connectEditor(), true)
    }
  }
</script>

<style scoped>
  .form {
    height: 100%;
  }
  #toolbar .logo {
    display: none;
  }
</style>
