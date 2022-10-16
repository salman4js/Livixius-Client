import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import CustomError from './CustomError';
import changeScreen from './Action';
import { Link, useNavigate, useParams } from "react-router-dom";
import Variables from './Variables';
import Loading from './Loading';
import axios from "axios";
import HomeRoom from './HomeRoom';


const LandingPage = () => {

    const { id } = useParams();

    let navigate = useNavigate();

    const splitedIds = id.split(/[-]/);

    const [room, setRoom] = useState([]);

    const [load, setLoad] = useState("");
    
    //Loader
    const [loading, setLoading] = useState(false);

    const getData = () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            setRoom(false)
        } else {
            axios.post(`${Variables.hostId}/${splitedIds[0]}/roomlodge`, {
                headers: {
                    "x-access-token": localStorage.getItem("token"),
                }
            })
                .then(res => {
                    if(res.data.success){
                        setLoading(false);
                        setRoom(res.data.message)
                        console.log(res.data.message)
                    } else {
                        setLoading(false);
                        localStorage.clear();
                        changeScreen();
                    }
                })
        }
    }

    useEffect(() => {
        getData()
    }, [load])

    const parseJwt = (token) => {
        try {
          return JSON.parse(atob(token.split(".")[1]));
        } catch (e) {
          return null;
        }
      };

    const AuthVerify = () => {
          const user = localStorage.getItem("token");
      
          if (user) {
            const decodedJwt = parseJwt(user);
      
            if (decodedJwt.exp * 1000 < Date.now()) {
              localStorage.clear();
              changeScreen();
            }
          }
    }


    useEffect(() => {
        const interval = setInterval(() => {
            AuthVerify();
        }, 9000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div>
            {
                room ? (
                    loading ? (
                        <Loading />
                    ) : (
                        <div>
                          <Navbar id={id} name={splitedIds[1]} />
                          <div className="text-center">
                              <div>
                                  <h3 className='heading-top topic-off'>
                                      {splitedIds[1]}
                                  </h3>
                              </div>
                          </div>
                          <div className='grid-system'>
                              <div class="container">
                                  <div class="row">
                                      {
                                          room.map((item, key) => {
                                              return (
                                                  <HomeRoom roomno={item.roomno} engaged={item.isOccupied} roomtype={item.suiteName} bedcount={item.bedCount} roomid={item._id} id={id} setLoad={setLoad} lodgeid = {splitedIds[0]} />
                                              )
                                          })
                                      }
                                  </div>
                              </div>
                          </div>
                      </div >
                    )
                      
                ) : (
                    <div>
                        <CustomError />
                    </div>
                )
            }
        </div>

    )
}

export default LandingPage