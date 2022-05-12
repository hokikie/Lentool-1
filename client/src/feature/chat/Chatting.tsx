import { useAppSelector } from "app/hooks";
import Loading from "feature/indicator/Loading";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useCreateroomMutation, useToolsEditMutation } from "services/api";

import io from "socket.io-client";

const socket = io(process.env.REACT_APP_SERVER_URL);

export default function Chatting() {
  let location = useLocation();
  const chatRef = useRef<any>()
  const roomdata: any = location.state;

  const [chattings, setchattings]: any = useState([]);
  const [chat, setchat] = useState("");
  const [roomid, setroomid] = useState(null);
  const [isLend, setIsLend] = useState(roomdata.islend);
  const [scroll, setScroll]:any = useState(null)
  // const [isMe, setIsMe]:any = useState(true)
  const myUserId = useAppSelector(
    (state) => state.persistedReducer.myinfo.user.id
  );
  const isowner = myUserId === roomdata.owner;

  const [createroom, { isLoading }] = useCreateroomMutation();
  const [toolsEdit] = useToolsEditMutation();

  const serchchat = async () => {
    const user = await createroom({
      user_id1: myUserId,
      user_id2: roomdata.user_id2,
      post_id: roomdata.post_id,
    }).unwrap();
    setchattings(user.data.chatings);
    socket.emit("join", { room_id: user.data.room_id });
    setroomid(user.data.room_id);
  };

  /* 확인하기 */
  useEffect(() => {
    serchchat();
    // chatRef.current.scrollTo(0, chatRef.current.scrollHeight)
  }, []);


  socket.on("message", ({ user_id, content }) => {
    setchattings([...chattings, { user_id, content }]);
  });

  const onTextChange = (e: any) => {
    setchat(e.target.value);
  };
  const onMessageSubmit = (e: any) => {
    e.preventDefault();
    const scroll:number = chatRef.current.scrollHeight + 56
    console.log(chatRef.current.scrollHeight)
    console.log(scroll)
    // chatRef.current.scrollTo(0, chatRef.current.scrollHeight)
    chatRef.current.scrollTo(0, scroll)
    socket.emit("message", {
      user_id: myUserId,
      content: chat,
      room_id: roomid,
      user_id2: roomdata.user_id2,
    });
    setchat("");
  };

  const handleLend = async () => {
    const sendData = [roomdata.post_id, { islend: !isLend }];
    const lend = await toolsEdit(sendData).unwrap();
    setIsLend(lend.data.post.islend);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-semibold text-gray-700 rounded-xl">{roomdata.title}</h1>
      <div className="flex py-4">
        <div className="flex flex-1 text-left">
          {roomdata.photo !== "empty" ? (
            <img
              src={`${process.env.REACT_APP_SERVER_URL}${roomdata.photo}`}
              alt="user_profile"
            />
          ) : (
            <img
              src="https://www.seekpng.com/png/detail/966-9665317_placeholder-image-person-jpg.png"
              alt="user_profile"
              className="w-12 h-12 rounded-full"
            />
          )}
          <span className="my-auto pl-2">{roomdata.nickname}</span>
        </div>
        <div>
          {isowner ? (
            <button
              onClick={handleLend}
              className="bg-yellow-300 text-white text-right px-4 py-2 rounded-lg hover:bg-yellow-500"
            >
              {isLend ? "대여중" : "대여 시작"}
            </button>
          ) : isLend ? (
            <button className="disabled bg-zinc-300 text-white text-right px-4 py-2 rounded-lg">
              대여중
            </button>
          ) : null}
        </div>
      </div>

      <div className="border overflow-auto h-[32rem] rounded-t-lg mt-4 py-4"
            ref={chatRef}>
        <div>
          {chattings.map(({ user_id, content }: any, index: any) => {
            return (
              <div key={index} className="mx-4 pb-4">
                <div
                  className={`flex text-left ${user_id === myUserId ? "justify-end" : "justify-start"}`}
                >
                  <span className="break-all max-w-[20rem] h-auto py-2 px-4 bg-gray-200 rounded-lg">
                    {content}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-gray-100 py-4 border-x"></div>
        <form
          onSubmit={onMessageSubmit}
          className="flex items-start relative h-full border rounded-b-lg"
        >
          <div className="flex-grow">
            <input
              name="content"
              onChange={(e) => onTextChange(e)}
              value={chat}
              maxLength={100}
              className="w-full h-full my-1 mx-2 focus:outline-none" 
              required
            />
          </div>
          <div className="text-right py-3">
            <span className="text-xs text-gray-700">{chat.length} / 100</span>
            <button className={`${chat ? 'bg-yellow-300' : 'bg-gray-300'} py-4 px-4 rounded-lg mx-4`}>
              전송
            </button>
          </div>
        </form>
    </div>
  );
}
