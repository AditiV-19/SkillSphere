export default function AboutCard({setProfile, isEditing, profile}) {

    return (

        <div className="bg-white rounded-3xl shadow-sm p-8">

            <h2 className="text-xl font-bold mb-4">

                About Me

            </h2>

           {
isEditing ?

(

<textarea

className="w-full border rounded-xl p-4"

value={profile.about}

onChange={(e)=>

setProfile({

...profile,

about:e.target.value

})

}

/>

)

:

(

<p>

{profile.about ||

"Tell clients about yourself."}

</p>

)
}

        </div>

    );

}