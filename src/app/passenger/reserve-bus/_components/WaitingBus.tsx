import { Bus } from "@/core/type/Bus";
import { ReserveBusStep } from "./ReserveBus";
import { useEffect, useState } from "react";
import useTouchEvents from "@/core/hooks/useTouchEvents";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { cancelReservation, getReservedBusArrInfo } from "@/core/api/blindrouteApi";
import LoadingAnimation from "@/app/_components/LoadingAnimation";
import styled from "styled-components";
import { Station } from "@/core/type/Station";
import { useSwipeable } from "react-swipeable";


export interface WaitingBusProps {
    setCurrStep: React.Dispatch<React.SetStateAction<ReserveBusStep>>;
    reservedBus: {
        station: Station;
        bus: Bus;
        reservationId: string;
    };
}


export default function WaitingBus({ setCurrStep, reservedBus }: WaitingBusProps) {
    // States
    const [waitingMsg, setWaitingMsg] = useState("대기중");
    const [isLoading, setIsLoading] = useState(false);
    const [busArrInfo, setBusArrInfo] = useState<{ arrmsg: string; vehId: string; } | null>(null);


    // Handler
    /** 안내 음성 */
    const handleAnnouncement = (type: "guide") => {
        //return;
        switch (type) {
            case "guide": {
                const currInfo = busArrInfo ? `${busArrInfo.arrmsg.split("[")[0]}에 도착합니다.` : "";
                SpeechOutputProvider.speak(`"${reservedBus.bus.busRouteAbrv}", 버스를 대기중입니다. ${currInfo}. 화면을 두번 터치를 하면 예약을 취소합니다`);
                break;
            }
        }
    }


    /** 이전 단계로 이동 */
    const handleBackToPrev = () => {
        setIsLoading(false);
        setCurrStep("selectStation");
    }


    /** 버스 예약 취소 */
    const handleCancelReservation = () => {
        cancelReservation().then(({ msg, deletedCount }) => {
            setIsLoading(false);
            setCurrStep("selectBus");
        });
    }


    /** horizontal 스와이프 이벤트 */
    const handleHorizontalSwiper = useSwipeable({
        onSwipedRight: () => {
            setIsLoading(true);
            handleCancelReservation();
        },
        trackMouse: true
    });


    /** 화면 터치 이벤트 */
    const handleBusInfoClick = useTouchEvents({
        onSingleTouch: () => {
            VibrationProvider.vibrate(1000);
            handleAnnouncement("guide");
        },
        onDoubleTouch: () => {
            VibrationProvider.repeatVibrate(500, 200, 2);
            setIsLoading(true);
            handleCancelReservation();
        },
    });


    // Effects
    /** 대기중 메시지 이벤트 */
    useEffect(() => {
        setTimeout(() => { handleAnnouncement("guide"); }, 400);
    }, [setCurrStep, reservedBus]);


    useEffect(() => {
        const intervalId = setInterval(() => {
            setWaitingMsg(prevMessage => {
                if (prevMessage === "대기중") return "대기중.";
                if (prevMessage === "대기중.") return "대기중..";
                if (prevMessage === "대기중..") return "대기중...";
                return "대기중";
            });
        }, 1000);

        return () => {
            clearInterval(intervalId);
        }
    }, [setWaitingMsg]);



    /** 예약한 버스가 도착했는지 2초마다 확인함 */
    useEffect(() => {
        const intervalId = setInterval(async () => {
            const newArrInfo = (await getReservedBusArrInfo(reservedBus.reservationId)).busArrInfo;
            if (newArrInfo !== null) {
                if (busArrInfo !== null) {
                    if (newArrInfo.vehId !== busArrInfo.vehId) {
                        console.log("버스가 도착하였습니다");
                        SpeechOutputProvider.speak("버스가 도착하였습니다");
                        setCurrStep("gettingOff");
                    }
                }
                setBusArrInfo(newArrInfo);
            }
        }, 2000);

        return () => {
            clearInterval(intervalId);
        }
    }, [reservedBus, busArrInfo, setBusArrInfo]);


    useEffect(() => {
        console.log(busArrInfo?.vehId, busArrInfo?.arrmsg);
    }, [busArrInfo])


    // Render
    return (
        <Wrapper {...handleHorizontalSwiper}>
            <LoadingAnimation active={isLoading} />
            <ReservationContainer
                onClick={handleBusInfoClick}
            >
                <ReservationBusName>{reservedBus.bus.busRouteAbrv}</ReservationBusName>
                <WiatingMessage>{waitingMsg}</WiatingMessage>
            </ReservationContainer>
        </Wrapper >
    );
}


const Wrapper = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;


const ReservationContainer = styled.div`
    height: 90%;
    width: 85%;
    border: 1px solid var(--main-border-color);
    border-radius: 8px;
    background-color: var(--main-color);
    color: var(--main-font-color);
    display: flex;
    flex-direction: column; 
    justify-content: center;
    align-items: center;
`;


const ReservationBusName = styled.h1` 
    font-size: 7vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;

const WiatingMessage = styled.h3` 
    font-size: 5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;
