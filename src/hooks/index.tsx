import { AsBind } from "as-bind";
import { Storage } from "aws-amplify";
import { S3 } from "aws-sdk";
import { useEffect, useState } from "react";


export const useWasm = (fileName: string, imports: {}) => {
  const [state, setState] = useState<{loaded: boolean, instance: any, module: any, error: {message: string} | null}>({
    loaded: false,
    instance: null,
    module: {},
    error: null,
  });
  useEffect(() => {
    console.log(fileName)
    const abortController = new AbortController();
    const fetchWasm = async () => {
      try {
        const signedURL = await Storage.get(fileName); // key

        WebAssembly.instantiateStreaming(fetch(signedURL), imports)
          .then(obj => {
            console.log(obj)
            setState({ loaded:true, instance: obj.instance, module: obj.module, error: null});
          })
          .catch(error => {
            setState({...state, error: error });
          });
      } catch (e: any) {
        if (!abortController.signal.aborted) {
          setState({...state, error: e });
        }
      }
    }
    fetchWasm();
    return function cleanup() {
      abortController.abort();
    };
  }, [fileName]);
  return state;
}