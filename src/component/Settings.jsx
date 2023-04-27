import { useState } from "react";
import confi from "../contract/Config.json";
import Abi from "../contract/Abi.json";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { Web3Button } from "@web3modal/react";

export default function Settings() {
  const inputProps = useInput();
  const { address, isConnected } = useAccount();
  const contractAddress = confi.CONTRACT_ADDRESS;
  const { config } = usePrepareContractWrite({
    address: contractAddress,
    abi: Abi,
    functionName: "setUsername",
    args: [inputProps.value],
  });
  const { data, write } = useContractWrite(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  function useInput(defaultValue) {
    const [value, setValue] = useState(defaultValue);
    function onChange(e) {
      setValue(e.target.value);
    }
    return {
      value,
      onChange,
    };
  }

  const { data: userName } = useContractRead({
    address: contractAddress,
    abi: Abi,
    functionName: "getUsername",
    watch: true,
    overrides: { from: address },
  });
  return (
    <div className="flex flex-col items-center justify-center h-screen ">
      <h1 className="pb-8 text-3xl font-bold text-teal-400">PROFILE SETTING</h1>
      {isConnected ? (
        <div className="flex flex-col items-center justify-center gap-4 w-md">
          <h1 className="text-xl">{userName}</h1>
          <input
            // eslint-disable-next-line react/no-unknown-property
            variant="static"
            label="username"
            className="p-2 border-2 border-teal-600 rounded-xl text-slate-500"
            {...inputProps}
            placeholder=" new username"
          />
          <span className="text-xs opacity-60">
            hint:empty value will remove the username
          </span>
          <button
            className="p-2 px-5 rounded bg-gradient-to-r hover:bg-gradient-to-l disabled:cursor-not-allowed from-teal-600 to-fuchsia-600 "
            disabled={!write || isLoading}
            onClick={() => write?.()}
          >
            {isLoading ? "please wait....." : "Set new User Name ⟩⟩"}
          </button>
          {isLoading && (
            <div> Setting new User Name... please Check your Wallet</div>
          )}
          {isSuccess && (
            <div className="flex flex-col items-center justify-center gap-4">
              <h1>New User Name Set Successfully</h1>
              <div>
                <a
                  href={`https://mumbai.polygonscan.com//tx/${data?.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-center bg-green-500 rounded-2xl"
                >
                  view on filecoin scan
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <h1> Please Connect Your wallet </h1>
          <Web3Button icon="hide" />
        </div>
      )}
    </div>
  );
}
